const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Health check for Railway (MUST have this)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'University Comm Hub API is running!',
        status: 'online',
        endpoints: {
            health: 'GET /health',
            login: 'POST /api/login',
            test: 'GET /api/test',
            register: 'POST /api/auth/register'
        }
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API test endpoint works' });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', email);
    
    const demoUsers = {
        'student@test.com': { password: 'student123', role: 'student', name: 'Student User' },
        'lecturer@test.com': { password: 'lecturer123', role: 'lecturer', name: 'Lecturer User' },
        'admin@test.com': { password: 'admin123', role: 'admin', name: 'Admin User' }
    };
    
    const user = demoUsers[email];
    if (user && user.password === password) {
        res.json({
            success: true,
            role: user.role,
            redirectUrl: '/dashboard/' + user.role,
            user: { name: user.name, email: email, role: user.role }
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Registration endpoint
app.post('/api/auth/register', (req, res) => {
    const { name, email, password, role, studentId, staffId } = req.body;
    
    // Simple validation
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    // Simulate successful registration
    res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: { name, email, role: role || 'student' }
    });
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found',
        path: req.originalUrl 
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('==================================================');
    console.log('University Comm Hub Backend');
    console.log('==================================================');
    console.log(? Server running on port ${PORT});
    console.log(? Health check: /health);
    console.log(? Root endpoint: /);
    console.log('==================================================');
});