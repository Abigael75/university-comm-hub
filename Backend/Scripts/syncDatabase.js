const { sequelize, testConnection } = require('../config/database');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const syncDatabase = async () => {
    console.log('Setting up database...');
    
    await testConnection();
    
    // Force sync will create tables (use { force: true } for fresh start)
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created');
    
    // Create default users
    const defaultUsers = [
        {
            name: 'Admin User',
            email: 'admin@test.com',
            password: await bcrypt.hash('admin123', 10),
            role: 'admin',
            department: 'Administration'
        },
        {
            name: 'Student User',
            email: 'student@test.com',
            password: await bcrypt.hash('student123', 10),
            role: 'student',
            studentId: 'COM/001/2020',
            department: 'Computer Science'
        },
        {
            name: 'Lecturer User',
            email: 'lecturer@test.com',
            password: await bcrypt.hash('lecturer123', 10),
            role: 'lecturer',
            staffId: 'STAFF/001',
            department: 'Computer Science'
        }
    ];
    
    await User.bulkCreate(defaultUsers);
    console.log('✅ Default users created');
    console.log('='.repeat(50));
    console.log('Database setup complete!');
    console.log('You can now use registration with SQLite!');
    console.log('='.repeat(50));
};

syncDatabase();
