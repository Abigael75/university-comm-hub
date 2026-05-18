const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.json({ message: 'Railway is working!', status: 'ok' });
});

app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API test endpoint works' });
});

app.listen(PORT, () => {
    console.log(Test server running on port ${PORT});
});
