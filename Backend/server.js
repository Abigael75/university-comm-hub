const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sequelize, testConnection } = require('./config/database');
const User = require('./models/User');
// Sync database tables (create if not exist)
await sequelize.sync({ alter: true });
console.log('? Database tables synced');
// Find this section:
await testConnection();`n    await sequelize.sync({ alter: true });`n    console.log("? Database tables synced");
await sequelize.sync({ alter: true });
console.log('? Database tables synced');


// Add this line right after:
await sequelize.sync({ alter: true });
console.log('? Database tables synced');

// Then the user count code:
const userCount = await User.count();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your-secret-key-change-this';

// Demo users fallback (only used if database is empty)
const demoUsers = {
    'admin@test.com': { password: 'admin123', role: 'admin', name: 'Admin User', id: 1 },
    'student@test.com': { password: 'student123', role: 'student', name: 'Student User', id: 2 },
    'lecturer@test.com': { password: 'lecturer123', role: 'lecturer', name: 'Lecturer User', id: 3 }
};

// LOGIN ENDPOINT - Check database FIRST, then demo
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', email);
    
    // FIRST: Try to find user in database
    try {
        const user = await User.findOne({ where: { email } });
        
        if (user) {
            console.log('Found user in database, role:', user.role);
            const isValid = await user.comparePassword(password);
            
            if (isValid) {
                // Update last login
                await user.update({ 
                    lastLogin: new Date(),
                    loginHistory: [...(user.loginHistory || []), {
                        timestamp: new Date(),
                        ipAddress: req.ip,
                        device: req.headers['user-agent'] || 'Unknown'
                    }]
                });
                
                const token = jwt.sign(
                    { id: user.id, email: user.email, role: user.role, name: user.name },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );
                
                console.log('Database login successful for:', email);
                return res.json({
                    success: true,
                    token,
                    role: user.role,
                    redirectUrl: '/dashboard/' + user.role,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            } else {
                console.log('Invalid password for database user:', email);
            }
        }
    } catch (err) {
        console.error('Database lookup error:', err.message);
    }
    
    // SECOND: Try demo users (fallback)
    const demoUser = demoUsers[email];
    if (demoUser && demoUser.password === password) {
        console.log('Demo login successful for:', email);
        const token = jwt.sign(
            { id: demoUser.id, email, role: demoUser.role, name: demoUser.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        return res.json({
            success: true,
            token,
            role: demoUser.role,
            redirectUrl: '/dashboard/' + demoUser.role,
            user: {
                id: demoUser.id,
                name: demoUser.name,
                email: email,
                role: demoUser.role
            }
        });
    }
    
    console.log('Login failed for:', email);
    res.status(401).json({ success: false, message: 'Invalid email or password' });
});

// REGISTRATION ENDPOINT
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role, studentId, staffId, department } = req.body;
        
        console.log('Registration attempt:', email);
        
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
            studentId: role === 'student' ? studentId : null,
            staffId: role === 'lecturer' ? staffId : null,
            department: department || 'General'
        });
        
        console.log('User registered successfully:', email, 'Role:', user.role);
        
        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            success: true,
            token,
            role: user.role,
            redirectUrl: '/dashboard/' + user.role,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Get all users (for admin)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'department', 'isActive', 'createdAt']
        });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
});

// Dashboard endpoints
app.get('/api/student/dashboard', (req, res) => {
    res.json({ success: true, message: 'Student Dashboard' });
});

app.get('/api/lecturer/dashboard', (req, res) => {
    res.json({ success: true, message: 'Lecturer Dashboard' });
});

app.get('/api/admin/dashboard', (req, res) => {
    res.json({ success: true, message: 'Admin Dashboard' });
});

app.get('/', (req, res) => {
    res.json({ message: 'University Comm Hub API Running' });
});

// Start server
app.listen(PORT, async () => {
    console.log('='.repeat(50));
    console.log('University Comm Hub Backend');
    console.log('='.repeat(50));
    console.log('Server running on http://localhost:' + PORT);
    
    await testConnection();`n    await sequelize.sync({ alter: true });`n    console.log("? Database tables synced");
await sequelize.sync({ alter: true });
console.log('? Database tables synced');

    
    // Count users in database
    const userCount = await User.count();
    console.log('Users in database: ' + userCount);
    
    console.log('-'.repeat(50));
    console.log('Login Options:');
    console.log('  1. Registered users (saved to database)');
    console.log('  2. Demo accounts (fallback):');
    console.log('     Student:  student@test.com / student123');
    console.log('     Lecturer: lecturer@test.com / lecturer123');
    console.log('     Admin:    admin@test.com / admin123');
    console.log('='.repeat(50));
});
app.get('/api/admin/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});
// Get all registered users (Admin only)
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'studentId', 'staffId', 'createdAt', 'isActive']
        });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete user (Admin only)
app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        await User.destroy({ where: { id: userId } });
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


