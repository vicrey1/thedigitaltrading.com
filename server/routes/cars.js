const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');

// Public routes (no authentication required)
router.get('/', carController.getCars);
router.get('/featured', carController.getFeaturedCars);
router.get('/filter-options', carController.getFilterOptions);
router.get('/:id', carController.getCarById);
router.post('/:id/inquiry', carController.recordInquiry);

// Admin routes (authentication + admin role required)
router.post('/', auth, authAdmin, carController.uploadImages, carController.createCar);
router.put('/:id', auth, authAdmin, carController.uploadImages, carController.updateCar);
router.delete('/:id', auth, authAdmin, carController.deleteCar);
router.patch('/:id/featured', auth, authAdmin, carController.toggleFeatured);
router.get('/admin/stats', auth, authAdmin, carController.getCarStats);

module.exports = router;