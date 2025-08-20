const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = require('./config/database');

async function initializeDatabase() {
  try {
    console.log('🗄️  Initializing database...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await pool.query(schema);
    
    // Create admin user with proper password hash
    const adminPassword = 'admin123';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
    
    // Insert or update admin user
    await pool.query(`
      INSERT INTO users (name, email, password_hash, address, role) 
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) 
      DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        role = EXCLUDED.role
    `, [
      'System Administrator',
      'admin@roxiler.com',
      passwordHash,
      '123 Admin Street, Admin City, AC 12345',
      'system_admin'
    ]);
    
    console.log('✅ Database schema created successfully!');
    console.log('✅ Admin user created/updated: admin@roxiler.com (password: admin123)');
    
    // Test the connection
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Database connection test successful. Users count: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase; 