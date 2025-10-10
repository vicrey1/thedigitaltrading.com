const Car = require('../models/Car');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/cars');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'car-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all cars with pagination and filtering
exports.getCars = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filters = {};
    
    // Basic filters
    if (req.query.make) filters.make = new RegExp(req.query.make, 'i');
    if (req.query.model) filters.model = new RegExp(req.query.model, 'i');
    if (req.query.bodyType) filters.bodyType = req.query.bodyType;
    if (req.query.fuelType) filters.fuelType = req.query.fuelType;
    if (req.query.transmission) filters.transmission = req.query.transmission;
    if (req.query.condition) filters.condition = req.query.condition;
    if (req.query.status) filters.status = req.query.status;
    
    // Price range
    if (req.query.minPrice || req.query.maxPrice) {
      filters.price = {};
      if (req.query.minPrice) filters.price.$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) filters.price.$lte = parseInt(req.query.maxPrice);
    }
    
    // Year range
    if (req.query.minYear || req.query.maxYear) {
      filters.year = {};
      if (req.query.minYear) filters.year.$gte = parseInt(req.query.minYear);
      if (req.query.maxYear) filters.year.$lte = parseInt(req.query.maxYear);
    }
    
    // Mileage filter
    if (req.query.maxMileage) {
      filters.mileage = { $lte: parseInt(req.query.maxMileage) };
    }
    
    // Search query
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filters.$or = [
        { make: searchRegex },
        { model: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }
    
    // Sort options
    let sortOption = { createdAt: -1 }; // Default sort
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'year_asc':
          sortOption = { year: 1 };
          break;
        case 'year_desc':
          sortOption = { year: -1 };
          break;
        case 'mileage_asc':
          sortOption = { mileage: 1 };
          break;
        case 'mileage_desc':
          sortOption = { mileage: -1 };
          break;
        case 'featured':
          sortOption = { featured: -1, priority: -1, createdAt: -1 };
          break;
        case 'popular':
          sortOption = { views: -1, inquiries: -1 };
          break;
      }
    }
    
    const total = await Car.countDocuments(filters);
    const cars = await Car.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    res.json({
      cars,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalCars: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get featured cars
exports.getFeaturedCars = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const cars = await Car.getFeatured(limit);
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get car by ID or slug
exports.getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    let car;
    
    // Check if it's a MongoDB ObjectId or a slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      car = await Car.findById(id)
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name');
    } else {
      car = await Car.findOne({ slug: id })
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name');
    }
    
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    // Increment views
    await car.incrementViews();
    
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new car (Admin only)
exports.createCar = async (req, res) => {
  try {
    const carData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    // Handle image uploads
    if (req.files && req.files.length > 0) {
      carData.images = req.files.map((file, index) => ({
        url: `/uploads/cars/${file.filename}`,
        caption: req.body[`imageCaption${index}`] || '',
        isPrimary: index === 0 // First image is primary by default
      }));
    }
    
    const car = new Car(carData);
    await car.save();
    
    const populatedCar = await Car.findById(car._id)
      .populate('createdBy', 'name');
    
    res.status(201).json(populatedCar);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update car (Admin only)
exports.updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };
    
    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/cars/${file.filename}`,
        caption: req.body[`imageCaption${index}`] || '',
        isPrimary: false
      }));
      
      // Get existing car to merge images
      const existingCar = await Car.findById(id);
      if (existingCar) {
        updateData.images = [...(existingCar.images || []), ...newImages];
      } else {
        updateData.images = newImages;
      }
    }
    
    const car = await Car.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('createdBy', 'name').populate('updatedBy', 'name');
    
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    res.json(car);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete car (Admin only)
exports.deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findById(id);
    
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    // Delete associated images
    if (car.images && car.images.length > 0) {
      car.images.forEach(image => {
        const imagePath = path.join(__dirname, '../', image.url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }
    
    await Car.findByIdAndDelete(id);
    res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get car statistics (Admin only)
exports.getCarStats = async (req, res) => {
  try {
    const totalCars = await Car.countDocuments();
    const availableCars = await Car.countDocuments({ status: 'Available' });
    const soldCars = await Car.countDocuments({ status: 'Sold' });
    const featuredCars = await Car.countDocuments({ featured: true });
    
    // Get popular makes
    const popularMakes = await Car.aggregate([
      { $group: { _id: '$make', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Get average price by body type
    const avgPriceByBodyType = await Car.aggregate([
      { $group: { _id: '$bodyType', avgPrice: { $avg: '$price' }, count: { $sum: 1 } } },
      { $sort: { avgPrice: -1 } }
    ]);
    
    // Get recent activity
    const recentCars = await Car.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name');
    
    res.json({
      overview: {
        totalCars,
        availableCars,
        soldCars,
        featuredCars
      },
      popularMakes,
      avgPriceByBodyType,
      recentCars
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle featured status (Admin only)
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findById(id);
    
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    car.featured = !car.featured;
    car.updatedBy = req.user.id;
    await car.save();
    
    res.json({ message: `Car ${car.featured ? 'featured' : 'unfeatured'} successfully`, featured: car.featured });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Record car inquiry
exports.recordInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findById(id);
    
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    await car.incrementInquiries();
    res.json({ message: 'Inquiry recorded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get filter options
exports.getFilterOptions = async (req, res) => {
  try {
    const makes = await Car.distinct('make');
    const bodyTypes = await Car.distinct('bodyType');
    const fuelTypes = await Car.distinct('fuelType');
    const transmissions = await Car.distinct('transmission');
    const conditions = await Car.distinct('condition');
    
    // Get price range
    const priceRange = await Car.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);
    
    // Get year range
    const yearRange = await Car.aggregate([
      {
        $group: {
          _id: null,
          minYear: { $min: '$year' },
          maxYear: { $max: '$year' }
        }
      }
    ]);
    
    res.json({
      makes: makes.sort(),
      bodyTypes,
      fuelTypes,
      transmissions,
      conditions,
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 100000 },
      yearRange: yearRange[0] || { minYear: 2000, maxYear: new Date().getFullYear() }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Export multer upload middleware
exports.uploadImages = upload.array('images', 10);

module.exports = exports;