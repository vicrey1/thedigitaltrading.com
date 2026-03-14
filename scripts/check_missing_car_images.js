// This script checks for missing car images in the uploads/cars directory and logs missing files.
// Run with: node scripts/check_missing_car_images.js

const fs = require('fs');
const path = require('path');
const db = require('../server/models/Car');
const mongoose = require('mongoose');

const UPLOADS_DIR = path.join(__dirname, '../server/uploads/cars');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/thedigitaltrading';

async function main() {
  await mongoose.connect(MONGO_URI);
  const cars = await db.find({});
  let missing = [];
  for (const car of cars) {
    if (Array.isArray(car.images)) {
      for (const img of car.images) {
        const imgFile = typeof img === 'string' ? img : img.url;
        if (!imgFile) continue;
        const filePath = path.join(UPLOADS_DIR, path.basename(imgFile));
        if (!fs.existsSync(filePath)) {
          missing.push({ car: car._id, file: imgFile });
        }
      }
    }
  }
  if (missing.length === 0) {
    console.log('No missing car images.');
  } else {
    console.log('Missing car images:');
    missing.forEach(m => console.log(`Car ID: ${m.car} - File: ${m.file}`));
  }
  mongoose.disconnect();
}

main();
