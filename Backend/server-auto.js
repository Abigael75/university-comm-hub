const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', email);
    
    const users = {
        'admin@test.com': { password: 'admin123', role: 'admin', name: 'Admin' },
        'user@test.com': { password: 'user123', role: 'user', name: 'User' }
    };
    
    const user = users[email];
    
    if (user && user.password === password) {
        res.json({
            success: true,
            role: user.role,
            redirectUrl: '/dashboard/' + user.role,
            message: 'Login successful'
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
    }
});

// Try to find an available port starting from 5000
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log('Backend server running on http://localhost:' + PORT);
    console.log('Test credentials: admin@test.com / admin123');
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying ${PORT + 1}...`);
        app.listen(PORT + 1, () => {
            console.log('Backend server running on http://localhost:' + (PORT + 1));
        });
    }
});
