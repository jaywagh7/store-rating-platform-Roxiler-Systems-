const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateStore } = require('../middleware/validation');

const router = express.Router();

// Get all stores with average ratings
router.get('/', async (req, res) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    let query = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.created_at,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
    `;

    const queryParams = [];
    let whereClause = '';

    // Add search functionality with multi-word support
    if (search && search.trim()) {
      const searchTerms = search.trim().split(/\s+/).filter(term => term.length > 0);
      
      if (searchTerms.length > 0) {
        const searchConditions = searchTerms.map((term, index) => {
          const paramIndex = queryParams.length + 1;
          queryParams.push(`%${term}%`);
          return `(s.name ILIKE $${paramIndex} OR s.address ILIKE $${paramIndex})`;
        });
        
        whereClause = 'WHERE ' + searchConditions.join(' AND ');
      }
    }

    query += whereClause + ' GROUP BY s.id, s.name, s.email, s.address, s.created_at';

    // Add sorting
    const allowedSortFields = ['name', 'email', 'address', 'average_rating', 'created_at'];
    const allowedSortOrders = ['asc', 'desc'];
    
    if (allowedSortFields.includes(sortBy) && allowedSortOrders.includes(sortOrder.toLowerCase())) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      query += ' ORDER BY s.name ASC';
    }

    const result = await pool.query(query, queryParams);
    
    res.json({
      stores: result.rows.map(store => ({
        ...store,
        average_rating: parseFloat(store.average_rating).toFixed(1)
      }))
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Get store by ID with ratings
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await pool.query(`
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.created_at,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings,
        ur.rating as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $2
      WHERE s.id = $1
      GROUP BY s.id, s.name, s.email, s.address, s.created_at, ur.rating
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const store = result.rows[0];
    res.json({
      store: {
        ...store,
        average_rating: parseFloat(store.average_rating).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// Create new store (Admin only)
router.post('/', authenticateToken, requireAdmin, validateStore, async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Check if store with email already exists
    const existingStore = await pool.query(
      'SELECT id FROM stores WHERE email = $1',
      [email]
    );

    if (existingStore.rows.length > 0) {
      return res.status(400).json({ error: 'Store with this email already exists' });
    }

    // If ownerId is provided, verify the user exists and is a store owner
    if (ownerId) {
      const ownerResult = await pool.query(
        'SELECT id, role FROM users WHERE id = $1',
        [ownerId]
      );

      if (ownerResult.rows.length === 0) {
        return res.status(400).json({ error: 'Owner user not found' });
      }

      if (ownerResult.rows[0].role !== 'store_owner') {
        return res.status(400).json({ error: 'Owner must be a store owner' });
      }
    }

    const result = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email, address, created_at',
      [name, email, address, ownerId || null]
    );

    res.status(201).json({
      message: 'Store created successfully',
      store: result.rows[0]
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ error: 'Failed to create store' });
  }
});

// Update store (Admin only)
router.put('/:id', authenticateToken, requireAdmin, validateStore, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, ownerId } = req.body;

    // Check if store exists
    const existingStore = await pool.query(
      'SELECT id FROM stores WHERE id = $1',
      [id]
    );

    if (existingStore.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if email is already taken by another store
    const emailCheck = await pool.query(
      'SELECT id FROM stores WHERE email = $1 AND id != $2',
      [email, id]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Store with this email already exists' });
    }

    // If ownerId is provided, verify the user exists and is a store owner
    if (ownerId) {
      const ownerResult = await pool.query(
        'SELECT id, role FROM users WHERE id = $1',
        [ownerId]
      );

      if (ownerResult.rows.length === 0) {
        return res.status(400).json({ error: 'Owner user not found' });
      }

      if (ownerResult.rows[0].role !== 'store_owner') {
        return res.status(400).json({ error: 'Owner must be a store owner' });
      }
    }

    const result = await pool.query(
      'UPDATE stores SET name = $1, email = $2, address = $3, owner_id = $4 WHERE id = $5 RETURNING id, name, email, address, updated_at',
      [name, email, address, ownerId || null, id]
    );

    res.json({
      message: 'Store updated successfully',
      store: result.rows[0]
    });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ error: 'Failed to update store' });
  }
});

// Delete store (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM stores WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ error: 'Failed to delete store' });
  }
});

module.exports = router; 