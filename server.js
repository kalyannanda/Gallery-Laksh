const express = require('express');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const db = require('./db');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/favicon.ico', (req, res) => res.sendStatus(204));

// Home and upload pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/upload', (req, res) => res.sendFile(path.join(__dirname, 'public', 'upload.html')));

// API: list images
app.get('/api/images', async (req, res) => {
  try {
    const images = await db.getImages();
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Serve image blob
app.get('/images/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const row = await db.getImageById(id);
    if (!row) return res.status(404).send('Not found');
    res.setHeader('Content-Type', row.mimetype);
    res.send(row.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete an image and its stored blob
app.delete('/api/images/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid image id' });
    }

    const result = await db.deleteImage(id);
    if (!result.deleted) return res.status(404).json({ error: 'Image not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Upload handler
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only JPEG, PNG, and WebP allowed' });
    }

    // Get dimensions via sharp
    let width = null, height = null;
    try {
      const meta = await sharp(req.file.buffer).metadata();
      width = meta.width || null;
      height = meta.height || null;
    } catch (e) {
      console.warn('sharp metadata failed', e.message);
    }

    const saved = await db.insertImage({
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      data: req.file.buffer,
      size: req.file.size,
      width,
      height
    });

    res.json({ success: true, id: saved.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
