const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all routes by serving index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'ar', 'index.html'));
});

// Handle 404 by serving Arabic index
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'ar', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Landing pages server running on port ${PORT}`);
  console.log(`📁 Serving from: ${path.join(__dirname, 'dist')}`);
});