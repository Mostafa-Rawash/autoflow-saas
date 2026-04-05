const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Root serves the main Arabic index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Language routes serve their respective index
app.get('/ar', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/en', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Handle 404 by serving Arabic index (for SPA-like behavior)
app.use((req, res) => {
  // Check if file exists
  const filePath = path.join(__dirname, 'dist', req.path + '.html');
  const fs = require('fs');
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Landing pages server running on port ${PORT}`);
  console.log(`📁 Serving from: ${path.join(__dirname, 'dist')}`);
});