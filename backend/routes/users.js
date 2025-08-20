const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireStoreOwner } = require('../middleware/auth');

const router = express.Router();

// Get store owner dashboard data
router.get('/dashboard', authenticateToken, requireStoreOwner, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get stores owned by the user
    const storesResult = await pool.query(`
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = $1
      GROUP BY s.id, s.name, s.email, s.address
    `, [userId]);

    // Get recent ratings for all stores owned by the user
    const ratingsResult = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        s.id as store_id,
        s.name as store_name
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      JOIN users u ON r.user_id = u.id
      WHERE s.owner_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [userId]);

    res.json({
      stores: storesResult.rows.map(store => ({
        ...store,
        average_rating: parseFloat(store.average_rating).toFixed(1)
      })),
      recentRatings: ratingsResult.rows
    });
  } catch (error) {
    console.error('Store owner dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get store ratings for a specific store owned by the user
router.get('/store/:storeId/ratings', authenticateToken, requireStoreOwner, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    // Verify the store belongs to the user
    const storeCheck = await pool.query(
      'SELECT id FROM stores WHERE id = $1 AND owner_id = $2',
      [storeId, userId]
    );

    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }

    const result = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.created_at DESC
    `, [storeId]);

    res.json({ ratings: result.rows });
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({ error: 'Failed to fetch store ratings' });
  }
});

module.exports = router; 