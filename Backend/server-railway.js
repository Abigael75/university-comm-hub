const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Simple health check
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        message: 'University Comm Hub API is running!',
        timestamp: new Date().toISOString()
    });
});

// Health endpoint for Railway
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API is working!' });
});

// Login endpoint (simple version)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'student@test.com' && password === 'student123') {
        res.json({ success: true, role: 'student', message: 'Login successful' });
    } else if (email === 'lecturer@test.com' && password === 'lecturer123') {
        res.json({ success: true, role: 'lecturer', message: 'Login successful' });
    } else if (email === 'admin@test.com' && password === 'admin123') {
        res.json({ success: true, role: 'admin', message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(? Server running on port ${PORT});
    console.log(Health check: http://localhost:${PORT}/health);
});
