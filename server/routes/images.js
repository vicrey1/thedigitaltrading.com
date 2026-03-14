const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Image = require('../models/Image');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload image (POST /api/images)
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    console.error('[IMAGE_UPLOAD] No file in request');
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    console.log('[IMAGE_UPLOAD] Uploading:', req.file.originalname, 'Size:', req.file.size, 'Type:', req.file.mimetype);
    const image = new Image({
      data: req.file.buffer,
      mimetype: req.file.mimetype,
      filename: req.file.originalname
    });
    await image.save();
    console.log('[IMAGE_UPLOAD] Saved with ID:', image._id);
    res.status(201).json({ id: image._id });
  } catch (err) {
    console.error('[IMAGE_UPLOAD] Error:', err.message);
    res.status(500).json({ error: 'Failed to save image', details: err.message });
  }
});

// Serve image (GET /api/images/:id)
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error('[IMAGE_SERVE] Invalid ObjectId:', req.params.id);
      return res.status(400).json({ error: 'Invalid image ID' });
    }
    const image = await Image.findById(req.params.id);
    if (!image) {
      console.error('[IMAGE_SERVE] Not found:', req.params.id);
      return res.status(404).send('Not found');
    }
    console.log('[IMAGE_SERVE] Serving:', image.filename, 'Type:', image.mimetype);
    res.set('Content-Type', image.mimetype);
    res.send(image.data);
  } catch (err) {
    console.error('[IMAGE_SERVE] Error:', err.message);
    res.status(500).json({ error: 'Error retrieving image', details: err.message });
  }
});

module.exports = router;
