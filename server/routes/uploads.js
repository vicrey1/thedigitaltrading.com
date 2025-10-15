const express = require('express');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');

const router = express.Router();

// Serve KYC uploads only to authenticated admins
router.get('/kyc/:filename', auth, (req, res, next) => {
  console.log('Decoded token for KYC file:', req.user);
  next();
}, authAdmin, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads/kyc', filename);
  
  // Check if file exists before attempting to serve it
  if (!fs.existsSync(filePath)) {
    console.error('KYC file not found:', filePath, 'Requested by admin:', req.user.id);
    return res.status(404).json({ 
      error: 'File not found', 
      message: `The requested KYC file "${filename}" does not exist on the server.`,
      filename: filename
    });
  }
  
  res.sendFile(filePath, err => {
    if (err) {
      console.error('KYC file serving error:', err, 'File:', filePath);
      res.status(500).json({ 
        error: 'File serving error', 
        message: 'An error occurred while serving the file.',
        filename: filename
      });
    } else {
      console.log('KYC file served successfully:', filePath, 'to admin:', req.user.id);
    }
  });
});

module.exports = router;
