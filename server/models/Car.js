const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  // Basic Information
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    default: null
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  
  // Vehicle Details
  bodyType: {
    type: String,
    required: true,
    enum: ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Truck', 'Van', 'Crossover', 'Sports Car', 'Luxury']
  },
  fuelType: {
    type: String,
    required: true,
    enum: ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'Hydrogen']
  },
  transmission: {
    type: String,
    required: true,
    enum: ['Manual', 'Automatic', 'CVT', 'Semi-Automatic']
  },
  drivetrain: {
    type: String,
    required: true,
    enum: ['FWD', 'RWD', 'AWD', '4WD']
  },
  
  // Technical Specifications
  engine: {
    displacement: { type: Number }, // in liters
    cylinders: { type: Number },
    horsepower: { type: Number },
    torque: { type: Number }
  },
  mileage: {
    type: Number,
    required: true,
    min: 0
  },
  fuelEconomy: {
    city: { type: Number }, // mpg
    highway: { type: Number }, // mpg
    combined: { type: Number } // mpg
  },
  
  // Condition & History
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Certified Pre-Owned', 'Used - Excellent', 'Used - Good', 'Used - Fair']
  },
  vin: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  previousOwners: {
    type: Number,
    default: 0,
    min: 0
  },
  accidentHistory: {
    type: Boolean,
    default: false
  },
  serviceHistory: {
    type: String,
    default: ''
  },
  
  // Features & Options
  exteriorColor: {
    type: String,
    required: true
  },
  interiorColor: {
    type: String,
    required: true
  },
  features: [{
    type: String
  }],
  safetyFeatures: [{
    type: String
  }],
  technologyFeatures: [{
    type: String
  }],
  
  // Media
  images: [{
    url: { type: String, required: true },
    caption: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false }
  }],
  videos: [{
    url: { type: String },
    title: { type: String },
    description: { type: String }
  }],
  
  // Description & Marketing
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  highlights: [{
    type: String
  }],
  
  // Availability & Status
  status: {
    type: String,
    enum: ['Available', 'Sold', 'Reserved', 'Under Review', 'Maintenance'],
    default: 'Available'
  },
  location: {
    dealership: { type: String, default: 'Digital Trading Motors' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'USA' },
    zipCode: { type: String }
  },
  
  // SEO & Search
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  tags: [{
    type: String,
    lowercase: true
  }],
  
  // Admin Fields
  featured: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
CarSchema.index({ make: 1, model: 1, year: 1 });
CarSchema.index({ price: 1 });
CarSchema.index({ bodyType: 1 });
CarSchema.index({ fuelType: 1 });
CarSchema.index({ status: 1 });
CarSchema.index({ featured: 1, priority: -1 });
CarSchema.index({ slug: 1 });
CarSchema.index({ createdAt: -1 });

// Virtual for full name
CarSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.make} ${this.model}`;
});

// Virtual for primary image
CarSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images.length > 0 ? this.images[0].url : null);
});

// Pre-save middleware to generate slug
CarSchema.pre('save', function(next) {
  if (this.isModified('make') || this.isModified('model') || this.isModified('year') || !this.slug) {
    const slugify = require('../utils/slugify');
    this.slug = slugify(`${this.year}-${this.make}-${this.model}-${this._id}`);
  }
  next();
});

// Static method to get featured cars
CarSchema.statics.getFeatured = function(limit = 6) {
  return this.find({ 
    status: 'Available', 
    featured: true 
  })
  .sort({ priority: -1, createdAt: -1 })
  .limit(limit)
  .populate('createdBy', 'name');
};

// Static method for advanced search
CarSchema.statics.advancedSearch = function(filters) {
  const query = { status: 'Available' };
  
  if (filters.make) query.make = new RegExp(filters.make, 'i');
  if (filters.model) query.model = new RegExp(filters.model, 'i');
  if (filters.minYear) query.year = { $gte: filters.minYear };
  if (filters.maxYear) query.year = { ...query.year, $lte: filters.maxYear };
  if (filters.minPrice) query.price = { $gte: filters.minPrice };
  if (filters.maxPrice) query.price = { ...query.price, $lte: filters.maxPrice };
  if (filters.bodyType) query.bodyType = filters.bodyType;
  if (filters.fuelType) query.fuelType = filters.fuelType;
  if (filters.transmission) query.transmission = filters.transmission;
  if (filters.condition) query.condition = filters.condition;
  if (filters.maxMileage) query.mileage = { $lte: filters.maxMileage };
  
  return this.find(query);
};

// Instance method to increment views
CarSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to increment inquiries
CarSchema.methods.incrementInquiries = function() {
  this.inquiries += 1;
  return this.save();
};

module.exports = mongoose.model('Car', CarSchema);