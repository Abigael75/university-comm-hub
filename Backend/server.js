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

const JWT_SECRET = 'your-secret-key-change-this';

// Demo users fallback
const demoUsers = {
    'admin@test.com': { password: 'admin123', role: 'admin', name: 'Admin User', id: 1 },
    'student@test.com': { password: 'student123', role: 'student', name: 'Student User', id: 2 },
    'lecturer@test.com': { password: 'lecturer123', role: 'lecturer', name: 'Lecturer User', id: 3 }
};

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'University Comm Hub API is running!', status: 'healthy' });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', email);
    
    try {
        const user = await User.findOne({ where: { email } });
        if (user && await user.comparePassword(password)) {
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role, name: user.name },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
            return res.json({
                success: true,
                token,
                role: user.role,
                redirectUrl: '/dashboard/' + user.role,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        }
    } catch (err) {
        console.log('Database lookup failed');
    }
    
    const demoUser = demoUsers[email];
    if (demoUser && demoUser.password === password) {
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
            user: { id: demoUser.id, name: demoUser.name, email, role: demoUser.role }
        });
    }
    
    res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role, studentId, staffId, department } = req.body;
        
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, email, password: hashedPassword, role: role || 'student',
            studentId: role === 'student' ? studentId : null,
            staffId: role === 'lecturer' ? staffId : null,
            department
        });
        
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
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
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

// Start server - WITH CORRECT ASYNC HANDLING
app.listen(PORT, async () => {
    console.log('==================================================');
    console.log('University Comm Hub Backend');
    console.log('==================================================');
    console.log('Server running on http://localhost:' + PORT);
    
    await testConnection();
    
    // Database sync - CORRECTLY PLACED INSIDE ASYNC FUNCTION
    await sequelize.sync({ alter: true });
    console.log('? Database tables synced');
    
    const userCount = await User.count();
    console.log('Users in database: ' + userCount);
    
    console.log('--------------------------------------------------');
    console.log('Demo Accounts:');
    console.log('  Student: student@test.com / student123');
    console.log('  Lecturer: lecturer@test.com / lecturer123');
    console.log('  Admin: admin@test.com / admin123');
    console.log('==================================================');
});