const app = require('./api/index');
const path = require('path');
const express = require('express');

const PORT = process.env.PORT || 5000;

// Serve public directory (posters, banners, qr codes)
app.use(express.static(path.join(__dirname, 'public')));

// Serve production frontend build if dist exists
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback for Single Page Application routing (non-API routes)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send(
        'IMovies API is running! Frontend is not built yet. Run "npm run build" to generate the frontend build, or run "npm run dev" for live development.'
      );
    }
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  🎬 IMovies Full-Stack App running on port ${PORT}`);
  console.log(`  🌐 Local App & API: http://localhost:${PORT}`);
  console.log(`  🩺 Health check:    http://localhost:${PORT}/api/health`);
  console.log(`  🌱 Atlas Seeder:    http://localhost:${PORT}/api/seed/status`);
  console.log(`====================================================`);
});
