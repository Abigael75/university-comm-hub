const bcrypt = require('bcrypt');
const { sequelize } = require('./config/database');
const User = require('./models/User');

async function testAuth() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');
        
        // Check existing users
        const users = await User.findAll();
        console.log('\nExisting users in database:');
        console.log('----------------------------------------');
        for (const user of users) {
            console.log('Email: ' + user.email);
            console.log('Role: ' + user.role);
            console.log('Name: ' + user.name);
            console.log('----------------------------------------');
        }
        
        // Test creating a new user
        console.log('\nAttempting to create a test user...');
        
        // Check if test user already exists
        let testUser = await User.findOne({ where: { email: 'test@demo.com' } });
        
        if (!testUser) {
            testUser = await User.create({
                name: 'Demo Test User',
                email: 'test@demo.com',
                password: await bcrypt.hash('demo123', 10),
                role: 'student',
                studentId: 'DEMO/001'
            });
            console.log('✅ Test user created successfully');
        } else {
            console.log('Test user already exists');
        }
        
        // Test login with the test user
        console.log('\nTesting login with test user...');
        const foundUser = await User.findOne({ where: { email: 'test@demo.com' } });
        
        if (foundUser) {
            const isValid = await bcrypt.compare('demo123', foundUser.password);
            if (isValid) {
                console.log('✅ Login successful for test@demo.com');
            } else {
                console.log('❌ Password verification failed');
            }
        } else {
            console.log('❌ User not found');
        }
        
        console.log('\n========================================');
        process.exit();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

testAuth();
