const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireNormalUser } = require('../middleware/auth');
const { validateRating } = require('../middleware/validation');

const router = express.Router();

// Submit or update rating for a store
router.post('/:storeId', authenticateToken, requireNormalUser, validateRating, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    // Check if store exists
    const storeResult = await pool.query(
      'SELECT id FROM stores WHERE id = $1',
      [storeId]
    );

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if user already rated this store
    const existingRating = await pool.query(
      'SELECT id, rating FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (existingRating.rows.length > 0) {
      // Update existing rating
      await pool.query(
        'UPDATE ratings SET rating = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND store_id = $3',
        [rating, userId, storeId]
      );

      res.json({
        message: 'Rating updated successfully',
        rating: {
          id: existingRating.rows[0].id,
          rating,
          store_id: parseInt(storeId),
          user_id: userId
        }
      });
    } else {
      // Create new rating
      const result = await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) RETURNING id, rating, store_id, user_id, created_at',
        [userId, storeId, rating]
      );

      res.status(201).json({
        message: 'Rating submitted successfully',
        rating: result.rows[0]
      });
    }
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// Get user's rating for a specific store
router.get('/:storeId', authenticateToken, requireNormalUser, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT id, rating, created_at, updated_at FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    res.json({ rating: result.rows[0] });
  } catch (error) {
    console.error('Get rating error:', error);
    res.status(500).json({ error: 'Failed to fetch rating' });
  }
});

// Get all ratings for a store (for store owners)
router.get('/store/:storeId', authenticateToken, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    // Check if user is store owner or admin
    let storeCheckQuery = '';
    let storeCheckParams = [];

    if (req.user.role === 'store_owner') {
      storeCheckQuery = 'AND s.owner_id = $2';
      storeCheckParams = [storeId, userId];
    } else if (req.user.role === 'system_admin') {
      storeCheckQuery = '';
      storeCheckParams = [storeId];
    } else {
      return res.status(403).json({ error: 'Access denied' });
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
      JOIN stores s ON r.store_id = s.id
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1 ${storeCheckQuery}
      ORDER BY r.created_at DESC
    `, storeCheckParams);

    res.json({ ratings: result.rows });
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({ error: 'Failed to fetch store ratings' });
  }
});

// Get average rating for a store
router.get('/store/:storeId/average', async (req, res) => {
  try {
    const { storeId } = req.params;

    const result = await pool.query(`
      SELECT 
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(*) as total_ratings
      FROM ratings 
      WHERE store_id = $1
    `, [storeId]);

    res.json({
      average_rating: parseFloat(result.rows[0].average_rating).toFixed(1),
      total_ratings: parseInt(result.rows[0].total_ratings)
    });
  } catch (error) {
    console.error('Get average rating error:', error);
    res.status(500).json({ error: 'Failed to fetch average rating' });
  }
});

// Delete rating (user can only delete their own rating)
router.delete('/:storeId', authenticateToken, requireNormalUser, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM ratings WHERE user_id = $1 AND store_id = $2 RETURNING id',
      [userId, storeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ error: 'Failed to delete rating' });
  }
});

module.exports = router; 