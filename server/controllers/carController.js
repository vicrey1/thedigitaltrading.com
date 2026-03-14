const Car = require('../models/Car');
// Robust image normalization for mixed formats
function normalizeCarImages(images) {
  return Array.isArray(images)
    ? images.map(img => {
        if (typeof img === 'string' && img.match(/^[a-f\d]{24}$/i)) {
          return { url: normalizeImageUrl(img) };
        }
        if (img && typeof img === 'object' && img._id) {
          return { url: normalizeImageUrl(img._id) };
        }
        if (img && typeof img === 'object' && img.url) {
          return { url: normalizeImageUrl(img.url) };
        }
        return { url: null };
      })
    : [];
}
// Normalize image URL so frontend never receives bare filenames
const normalizeImageUrl = (id) => {
  if (!id) return null;
  // Return the API endpoint for the image
  return `/api/images/${id}`;
};

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
    const safeCars = cars.map(car => {
      const obj = car.toObject ? car.toObject() : car;
      obj.images = normalizeCarImages(obj.images);
      obj.features = Array.isArray(obj.features) ? obj.features : [];
      obj.primaryImage = obj.primaryImage || (obj.images[0] ? obj.images[0].url : null);
      obj.primaryImage = normalizeImageUrl(obj.primaryImage);
      return obj;
    });
    
    res.json({
      cars: safeCars,
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
    const safeCars = cars.map(car => {
      const obj = car.toObject ? car.toObject() : car;
      obj.images = normalizeCarImages(obj.images);
      obj.features = Array.isArray(obj.features) ? obj.features : [];
      obj.primaryImage = obj.primaryImage || (obj.images[0] ? obj.images[0].url : null);
      obj.primaryImage = normalizeImageUrl(obj.primaryImage);
      return obj;
    });
    // Return consistent response shape with cars array
    res.json({ cars: safeCars });
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
    const obj = car.toObject ? car.toObject() : car;
    obj.images = normalizeCarImages(obj.images);
    obj.features = Array.isArray(obj.features) ? obj.features : [];
    obj.primaryImage = obj.primaryImage || (obj.images[0] ? obj.images[0].url : null);
    obj.primaryImage = normalizeImageUrl(obj.primaryImage);
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new car (Admin only)
exports.createCar = async (req, res) => {
  try {
    console.log('[CAR_CREATE] Request body keys:', Object.keys(req.body));
    console.log('[CAR_CREATE] Request files:', req.files ? req.files.map(f => f.filename) : 'none');
    
    // Map frontend fields to backend schema
    const mapCondition = (val) => {
      const map = {
        'excellent': 'Used - Excellent',
        'good': 'Used - Good',
        'fair': 'Used - Fair',
        'poor': 'Used - Fair',
        'new': 'New',
        'certified': 'Certified Pre-Owned'
      };
      return map[val?.toLowerCase()] || 'Used - Excellent';
    };
    const mapBodyType = (val) => {
      const map = {
        'sedan': 'Sedan',
        'suv': 'SUV',
        'hatchback': 'Hatchback',
        'coupe': 'Coupe',
        'convertible': 'Convertible',
        'wagon': 'Wagon',
        'truck': 'Truck',
        'van': 'Van',
        'crossover': 'Crossover',
        'sports car': 'Sports Car',
        'luxury': 'Luxury'
      };
      return map[val?.toLowerCase()] || 'Sedan';
    };
    const mapFuelType = (val) => {
      const map = {
        'gasoline': 'Gasoline',
        'diesel': 'Diesel',
        'electric': 'Electric',
        'hybrid': 'Hybrid',
        'plug-in hybrid': 'Plug-in Hybrid',
        'hydrogen': 'Hydrogen',
        'lpg': 'Gasoline'
      };
      return map[val?.toLowerCase()] || 'Gasoline';
    };
    const mapTransmission = (val) => {
      const map = {
        'automatic': 'Automatic',
        'manual': 'Manual',
        'cvt': 'CVT',
        'semi-automatic': 'Semi-Automatic'
      };
      return map[val?.toLowerCase()] || 'Automatic';
    };
    // Default drivetrain
    const defaultDrivetrain = 'AWD';

    // Parse location
    let locationObj = {
      dealership: 'Digital Trading Motors',
      city: req.body.location || 'Unknown',
      state: 'NY',
      country: 'USA'
    };

    // Map frontend to backend
    // Ensure isAvailable is boolean
    let isAvailable = req.body.isAvailable;
    if (typeof isAvailable === 'string') {
      isAvailable = isAvailable === 'true';
    }

    const carData = {
      title: req.body.title,
      description: req.body.description,
      make: req.body.make,
      model: req.body.model,
      year: Number(req.body.year),
      price: Number(req.body.price),
      originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : undefined,
      currency: 'USD',
      bodyType: mapBodyType(req.body.bodyType),
      fuelType: mapFuelType(req.body.fuelType),
      transmission: mapTransmission(req.body.transmission),
      drivetrain: defaultDrivetrain,
      mileage: Number(req.body.mileage),
      condition: mapCondition(req.body.condition),
      exteriorColor: req.body.color,
      interiorColor: req.body.color,
      features: Array.isArray(req.body.features) ? req.body.features : (req.body.features ? JSON.parse(req.body.features) : []),
      status: isAvailable ? 'Available' : 'Sold',
      location: locationObj,
      contactPhone: req.body.contactPhone,
      contactEmail: req.body.contactEmail,
      featured: !!req.body.isFeatured,
      createdBy: req.user.id
    };

    // Handle image references from frontend (MongoDB ObjectIds)
    if (req.body.images && Array.isArray(req.body.images)) {
      console.log('[CAR_CREATE] Images in request:', req.body.images);
      carData.images = req.body.images; // Store ObjectIds directly
    } else {
      console.log('[CAR_CREATE] No images in request');
    }

    console.log('[CAR_CREATE] Creating car with data:', { title: carData.title, make: carData.make, model: carData.model, imageCount: carData.images?.length || 0 });
    const car = new Car(carData);
    console.log('[CAR_CREATE] Car object created, saving...');
    await car.save();
    console.log('[CAR_CREATE] Car saved with ID:', car._id);

    let populatedCar = await Car.findById(car._id)
      .populate('createdBy', 'name');
    let obj = populatedCar.toObject ? populatedCar.toObject() : populatedCar;
    obj.images = normalizeCarImages(obj.images);
    obj.features = Array.isArray(obj.features) ? obj.features : [];
    obj.primaryImage = obj.primaryImage || (obj.images[0] ? obj.images[0].url : null);
    obj.primaryImage = normalizeImageUrl(obj.primaryImage);
    console.log('[CAR_CREATE] Returning car response');
    res.status(201).json(obj);
  } catch (err) {
    console.error('[CAR_CREATE] Error:', err.message);
    console.error('[CAR_CREATE] Full error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Update car (Admin only)
exports.updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[CAR_UPDATE] Updating car:', id);
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };
    
    // Handle new image references from frontend (MongoDB ObjectIds)
    if (req.body.images && Array.isArray(req.body.images)) {
      console.log('[CAR_UPDATE] Images in request:', req.body.images);
      updateData.images = req.body.images; // Store ObjectIds directly
    }
    
    console.log('[CAR_UPDATE] Updating with data:', { imageCount: updateData.images?.length || 0 });
    const car = await Car.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('createdBy', 'name').populate('updatedBy', 'name');
    
    if (!car) {
      console.error('[CAR_UPDATE] Car not found:', id);
      return res.status(404).json({ error: 'Car not found' });
    }
    
    console.log('[CAR_UPDATE] Car updated successfully');
    const cc = car.toObject ? car.toObject() : car;
    cc.images = normalizeCarImages(cc.images);
    cc.features = Array.isArray(cc.features) ? cc.features : [];
    cc.primaryImage = cc.primaryImage || (cc.images[0] ? cc.images[0].url : null);
    cc.primaryImage = normalizeImageUrl(cc.primaryImage);
    res.json(cc);
  } catch (err) {
    console.error('[CAR_UPDATE] Error:', err.message);
    console.error('[CAR_UPDATE] Full error:', err);
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
    const recentCarsRaw = await Car.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name');

    // Normalize images and primaryImage for recentCars
    const recentCars = recentCarsRaw.map(car => {
      const obj = car.toObject ? car.toObject() : car;
      obj.images = Array.isArray(obj.images)
        ? obj.images.map(img => {
            if (typeof img === 'string' && img.match(/^[a-f\d]{24}$/i)) {
              return { url: normalizeImageUrl(img) };
            }
            if (img && typeof img === 'object' && img._id) {
              return { url: normalizeImageUrl(img._id) };
            }
            if (img && typeof img === 'object' && img.url) {
              return { url: normalizeImageUrl(img.url) };
            }
            return { url: null };
          })
        : [];
      obj.primaryImage = obj.primaryImage || (obj.images[0] ? obj.images[0].url : null);
      obj.primaryImage = normalizeImageUrl(obj.primaryImage);
      return obj;
    });

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


module.exports = exports;