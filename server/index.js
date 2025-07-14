const express = require('express');
const cors = require('cors');
const analyzeRouter = require('./routes/analyze');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/analyze', analyzeRouter);
const path = require('path');

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client/build')));

// Fallback for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
