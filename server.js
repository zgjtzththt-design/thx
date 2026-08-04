const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set permissive CORS and media headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Accept-Ranges', 'bytes');
  next();
});

// Block development server from modifying files in /appData directory
app.use((req, res, next) => {
  const urlPath = req.path.toLowerCase();
  if (urlPath.includes('/appdata')) {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method.toUpperCase())) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Dev server is blocked from modifying files in appData directory.'
      });
    }
  }
  next();
});

// Alias /OriginWEB/* to root directory so legacy paths work without 404s
app.use('/OriginWEB', express.static(path.join(__dirname), {
  fallthrough: true,
  etag: true,
  acceptRanges: true,
}));

// Serve root static files
app.use(express.static(path.join(__dirname), {
  fallthrough: true,
  etag: true,
  acceptRanges: true,
}));

// Fallback to index.html for root or missing routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`OriginOS WEB server listening on http://0.0.0.0:${PORT}`);
});
