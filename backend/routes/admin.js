const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateUser, validateStore } = require('../middleware/validation');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// Get admin dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [usersCount, storesCount, ratingsCount] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM stores'),
      pool.query('SELECT COUNT(*) as count FROM ratings')
    ]);

    res.json({
      statistics: {
        totalUsers: parseInt(usersCount.rows[0].count),
        totalStores: parseInt(storesCount.rows[0].count),
        totalRatings: parseInt(ratingsCount.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get all users with filtering and sorting
router.get('/users', async (req, res) => {
  try {
    const { search, role, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    let query = 'SELECT id, name, email, role, address, created_at FROM users';
    const queryParams = [];
    let whereConditions = [];

    // Add search functionality with multi-word support
    if (search && search.trim()) {
      const searchTerms = search.trim().split(/\s+/).filter(term => term.length > 0);
      
      if (searchTerms.length > 0) {
        const searchConditions = searchTerms.map((term, index) => {
          const paramIndex = queryParams.length + 1;
          queryParams.push(`%${term}%`);
          return `(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR address ILIKE $${paramIndex})`;
        });
        
        whereConditions.push('(' + searchConditions.join(' AND ') + ')');
      }
    }

    // Add role filter
    if (role) {
      const paramIndex = queryParams.length + 1;
      whereConditions.push(`role = $${paramIndex}`);
      queryParams.push(role);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    // Add sorting
    const allowedSortFields = ['name', 'email', 'role', 'address', 'created_at'];
    const allowedSortOrders = ['asc', 'desc'];
    
    if (allowedSortFields.includes(sortBy) && allowedSortOrders.includes(sortOrder.toLowerCase())) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      query += ' ORDER BY name ASC';
    }

    const result = await pool.query(query, queryParams);
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID with details
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.address, 
        u.created_at,
        CASE 
          WHEN u.role = 'store_owner' THEN (
            SELECT COALESCE(AVG(r.rating), 0)
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            WHERE s.owner_id = u.id
          )
          ELSE NULL
        END as store_rating
      FROM users u
      WHERE u.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    if (user.store_rating !== null) {
      user.store_rating = parseFloat(user.store_rating).toFixed(1);
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user
router.post('/users', validateUser, async (req, res) => {
  try {
    const { name, email, password, address, role = 'normal_user' } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, address, created_at',
      [name, email, passwordHash, address, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/users/:id', validateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, address, role } = req.body;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is already taken by another user
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, id]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    let query, queryParams;

    if (password) {
      // Hash new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      query = 'UPDATE users SET name = $1, email = $2, password_hash = $3, address = $4, role = $5 WHERE id = $6 RETURNING id, name, email, role, address, updated_at';
      queryParams = [name, email, passwordHash, address, role, id];
    } else {
      query = 'UPDATE users SET name = $1, email = $2, address = $3, role = $4 WHERE id = $5 RETURNING id, name, email, role, address, updated_at';
      queryParams = [name, email, address, role, id];
    }

    const result = await pool.query(query, queryParams);

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all stores with filtering and sorting
router.get('/stores', async (req, res) => {
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
        COUNT(r.id) as total_ratings,
        u.name as owner_name
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN users u ON s.owner_id = u.id
    `;

    const queryParams = [];
    let whereClause = '';

    // Add search functionality
    if (search) {
      whereClause = 'WHERE s.name ILIKE $1 OR s.email ILIKE $1 OR s.address ILIKE $1';
      queryParams.push(`%${search}%`);
    }

    query += whereClause + ' GROUP BY s.id, s.name, s.email, s.address, s.created_at, u.name';

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

// Update user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['system_admin', 'normal_user', 'store_owner'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be one of: system_admin, normal_user, store_owner' });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id, role FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update role
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, address, updated_at',
      [role, id]
    );

    res.json({
      message: 'User role updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

module.exports = router; 