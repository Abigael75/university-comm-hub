const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sequelize, testConnection } = require('./config/database');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your-secret-key';

// ... your routes here (app.post, app.get, etc.)

// ✅ CORRECT - sync inside the async callback
app.listen(PORT, async () => {
    console.log('='.repeat(50));
    console.log('University Comm Hub Backend');
    console.log('='.repeat(50));
    console.log('Server running on http://localhost:' + PORT);
    
    await testConnection();
    
    // This is the correct place for sequelize.sync()
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synced');
    
    const userCount = await User.count();
    console.log('Users in database: ' + userCount);
    
    console.log('-'.repeat(50));
    console.log('Login Options:');
    console.log('  Demo accounts:');
    console.log('     Student: student@test.com / student123');
    console.log('     Lecturer: lecturer@test.com / lecturer123');
    console.log('     Admin: admin@test.com / admin123');
    console.log('='.repeat(50));
});