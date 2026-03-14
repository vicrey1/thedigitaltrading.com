const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  data: { type: Buffer, required: true },
  mimetype: { type: String, required: true },
  filename: { type: String },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Image', ImageSchema);