const express = require('express');
const compression = require('compression');
const path = require('path');

const app = express();
app.use(compression());

// Basit güvenlik headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  next();
});

// Statik dosyalar (index.html kökte)
app.use(express.static(path.join(__dirname), {
  setHeaders(res, filePath) {
    if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

app.get('/healthz', (_req, res) => res.send('ok'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Prim Paneli çalışıyor -> PORT', port);
});
