const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = require('./config/database');

async function updateAdminPassword() {
  try {
    console.log('🔐 Updating admin password...');
    
    // Create admin user with proper password hash
    const adminPassword = 'admin123';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
    
    // Update admin user
    const result = await pool.query(`
      UPDATE users 
      SET password_hash = $1 
      WHERE email = 'admin@roxiler.com'
      RETURNING id, name, email, role
    `, [passwordHash]);
    
    if (result.rows.length === 0) {
      // If admin doesn't exist, create it
      await pool.query(`
        INSERT INTO users (name, email, password_hash, address, role) 
        VALUES ($1, $2, $3, $4, $5)
      `, [
        'System Administrator',
        'admin@roxiler.com',
        passwordHash,
        '123 Admin Street, Admin City, AC 12345',
        'system_admin'
      ]);
      console.log('✅ Admin user created: admin@roxiler.com (password: admin123)');
    } else {
      console.log('✅ Admin password updated: admin@roxiler.com (password: admin123)');
    }
    
  } catch (error) {
    console.error('❌ Error updating admin password:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  updateAdminPassword();
}

module.exports = updateAdminPassword; 