const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Roxiler FullStack Store Rating System Setup');
console.log('==============================================');

// Check if .env file exists in backend
const envPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n⚠️  Environment Setup Required:');
  console.log('1. Copy backend/env.example to backend/.env');
  console.log('2. Update the .env file with your database credentials:');
  console.log('   - DB_PASSWORD=your_postgres_password');
  console.log('   - JWT_SECRET=your_random_secret_key');
  console.log('   - Other settings as needed');
} else {
  console.log('✅ Environment file found');
}

console.log('\n📋 Next Steps:');
console.log('1. Install dependencies: npm run install-all');
console.log('2. Create PostgreSQL database: roxiler_ratings');
console.log('3. Initialize database: npm run db:init');
console.log('4. Start development: npm run dev');
console.log('\n🌐 Access the application:');
console.log('- Frontend: http://localhost:3000');
console.log('- Backend API: http://localhost:5000');
console.log('\n🔑 Default Admin: admin@roxiler.com / admin123');