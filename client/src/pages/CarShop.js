import React, { useState, useEffect } from 'react';
import {
  FiSearch, FiFilter, FiHeart, FiEye, FiPhone, FiMail, FiMapPin, FiTruck, FiX, FiChevronLeft, FiChevronRight, FiStar, FiCalendar, FiActivity, FiDollarSign
} from 'react-icons/fi';
import axios from 'axios';

const CarShop = () => {
  // State hooks
  const [featuredCars, setFeaturedCars] = useState([]);
  const [cars, setCars] = useState([]);
  const [filters, setFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [priceRanges, setPriceRanges] = useState([]);

  // Utility functions
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatLocation = (loc) => {
    if (!loc) return '';
    if (typeof loc === 'string') return loc;
    const parts = [];
    if (loc.city) parts.push(loc.city);
    if (loc.state) parts.push(loc.state);
    if (parts.length) return parts.join(', ');
    if (loc.dealership) return loc.dealership;
    try { return JSON.stringify(loc); } catch (e) { return ''; }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//.test(url)) return url;
    if (url.startsWith('/uploads')) return `${window.location.origin}${url}`;
    return url;
  };

  // Modal handlers
  const openCarModal = (car) => {
    setSelectedCar(car);
    setShowModal(true);
    setSelectedImages(Array.isArray(car.images) ? car.images : []);
    setCurrentImageIndex(0);
    setSelectedFeatures(Array.isArray(car.features) ? car.features : []);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedCar(null);
    setSelectedImages([]);
    setCurrentImageIndex(0);
    setSelectedFeatures([]);
  };

  // Fetch cars and filter options
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/cars', {
          params: {
            page: currentPage,
            limit: 12,
            ...filters,
            search: searchTerm
          }
        });
        setCars(res.data.cars);
        setTotalPages(res.data.totalPages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cars:', error);
        setLoading(false);
      }
    };

    const fetchFilterOptions = async () => {
      try {
        const res = await axios.get('/api/cars/filters');
        setFilterOptions(res.data);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchCars();
    fetchFilterOptions();
  }, [currentPage, filters, searchTerm]);

  // Filter change handler
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  const prevImage = () => {
    if (!selectedImages.length) return;
    setCurrentImageIndex((prev) => prev === 0 ? selectedImages.length - 1 : prev - 1);
  };
  const nextImage = () => {
    if (!selectedImages.length) return;
    setCurrentImageIndex((prev) => prev === selectedImages.length - 1 ? 0 : prev + 1);
  };
  const handleInquiry = async (carId) => {
    try {
      await axios.post(`/api/cars/${carId}/inquiry`);
      alert('Thank you for your inquiry! We will contact you soon.');
    } catch (error) {
      console.error('Error recording inquiry:', error);
      alert('Thank you for your interest! Please contact us directly.');
    }
  };

  // CarCard component
  const CarCard = ({ car }) => {
    // Map car.images (array of ObjectIds or URLs) to /api/images/:id URLs if needed
    let images = Array.isArray(car.images) ? car.images : [];
    // If images are ObjectIds (MongoDB), map to /api/images/:id
    images = images.map(img => {
      if (typeof img === 'string' && img.match(/^[a-f\d]{24}$/i)) {
        return `/api/images/${img}`;
      }
      if (img && typeof img === 'object' && img._id) {
        return `/api/images/${img._id}`;
      }
      if (img && typeof img === 'object' && img.url) {
        return img.url;
      }
      return img;
    });
    let displayImage = images.length > 0 ? images[0] : '';
    return (
      <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-800">
        <div className="relative">
          {displayImage ? (
            <img
              src={displayImage}
              alt={car.title}
              className="w-full h-48 object-cover"
              onError={e => { e.target.onerror = null; e.target.src = '/placeholder-car.png'; }}
            />
          ) : (
            <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
              <FiTruck className="text-gray-600 text-4xl" />
            </div>
          )}
          {car.isFeatured && (
            <div className="absolute top-3 left-3 bg-gold text-black px-2 py-1 rounded-full text-xs font-bold flex items-center">
              <FiStar className="mr-1" size={12} />
              Featured
            </div>
          )}
          {car.originalPrice && car.originalPrice > car.price && (
            <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
              Sale
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{car.title}</h3>
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-2xl font-bold text-gold">{formatPrice(car.price)}</div>
              {car.originalPrice && car.originalPrice > car.price && (
                <div className="text-sm text-gray-400 line-through">{formatPrice(car.originalPrice)}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">{car.year}</div>
              <div className="text-sm text-gray-400">{car.mileage?.toLocaleString()} miles</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-300">
            <div className="flex items-center">
              <FiActivity className="mr-2 text-gold" size={14} />
              {car.mileage} miles
            </div>
            <div className="flex items-center">
              <FiTruck className="mr-2 text-gold" size={14} />
              {car.transmission}
            </div>
            <div className="flex items-center">
              <FiMapPin className="mr-2 text-gold" size={14} />
              {formatLocation(car.location)}
            </div>
            <div className="flex items-center">
              <FiEye className="mr-2 text-gold" size={14} />
              {car.views || 0} views
            </div>
          </div>
          
          <button
            onClick={() => openCarModal(car)}
            className="w-full bg-gold text-black py-2 px-4 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  // Main CarShop component return
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gold mb-4">
              Premium Car Collection
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover exceptional vehicles from our curated selection of premium automobiles
            </p>
          </div>
        </div>
      </div>

      {/* Featured Cars */}
      {featuredCars.length > 0 && (
        <div className="py-12 bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gold mb-8 text-center">Featured Vehicles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCars.slice(0, 3).map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="py-8 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search cars by make, model, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold"
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <FiFilter />
              Filters
            </button>
            
            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-800 rounded-lg border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Brand</label>
                  <select
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gold"
                  >
                    <option value="">All Brands</option>
                    {filterOptions.brands?.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gold"
                  >
                    <option value="">All Prices</option>
                    {priceRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fuel Type</label>
                  <select
                    value={filters.fuelType}
                    onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gold"
                  >
                    <option value="">All Fuel Types</option>
                    {filterOptions.fuelTypes?.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Transmission</label>
                  <select
                    value={filters.transmission}
                    onChange={(e) => handleFilterChange('transmission', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gold"
                  >
                    <option value="">All Transmissions</option>
                    {filterOptions.transmissions?.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Body Type</label>
                  <select
                    value={filters.bodyType}
                    onChange={(e) => handleFilterChange('bodyType', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gold"
                  >
                    <option value="">All Body Types</option>
                    {filterOptions.bodyTypes?.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
                  <select
                    value={filters.condition}
                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gold"
                  >
                    <option value="">All Conditions</option>
                    {filterOptions.conditions?.map(condition => (
                      <option key={condition} value={condition}>{condition.charAt(0).toUpperCase() + condition.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cars Grid */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
              <p className="mt-4 text-gray-400">Loading vehicles...</p>
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-12">
              <FiTruck className="mx-auto text-6xl text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No vehicles found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">
                  Available Vehicles ({cars.length} found)
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {cars.map((car) => (
                  <CarCard key={car._id} car={car} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                    >
                      Previous
                    </button>
                    
                    <span className="px-4 py-2 text-gray-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Car Detail Modal */}
      {showModal && selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white">{selectedCar.title}</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div>
                  {selectedImages.length === 0 ? (
                    <div className="w-full h-80 bg-gray-800 rounded-lg flex items-center justify-center">
                      <FiTruck className="text-gray-600 text-6xl" />
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={getImageUrl(selectedImages[currentImageIndex]?.url)}
                        alt={selectedCar.title}
                        className="w-full h-80 object-cover rounded-lg"
                      />
                      {selectedImages.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                          >
                            <FiChevronLeft size={20} />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                          >
                            <FiChevronRight size={20} />
                          </button>

                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                            {selectedImages.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all ${
                                  index === currentImageIndex ? 'bg-gold' : 'bg-gray-400'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Thumbnail Gallery */}
                  {selectedImages.length > 1 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {selectedImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative rounded-lg overflow-hidden ${
                            index === currentImageIndex ? 'ring-2 ring-gold' : ''
                          }`}
                        >
                          <img
                            src={getImageUrl(image.url)}
                            alt={`${selectedCar.title} ${index + 1}`}
                            className="w-full h-20 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Car Details */}
                <div>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-3xl font-bold text-gold">{formatPrice(selectedCar.price)}</div>
                        {selectedCar.originalPrice && selectedCar.originalPrice > selectedCar.price && (
                          <div className="text-lg text-gray-400 line-through">{formatPrice(selectedCar.originalPrice)}</div>
                        )}
                      </div>
                      {selectedCar.isFeatured && (
                        <div className="bg-gold text-black px-3 py-1 rounded-full text-sm font-bold flex items-center">
                          <FiStar className="mr-1" size={14} />
                          Featured
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-gray-400 text-sm">Year</div>
                        <div className="text-white font-semibold">{selectedCar.year}</div>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-gray-400 text-sm">Mileage</div>
                        <div className="text-white font-semibold">{selectedCar.mileage?.toLocaleString()} miles</div>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-gray-400 text-sm">Fuel Type</div>
                        <div className="text-white font-semibold">{selectedCar.fuelType}</div>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-gray-400 text-sm">Transmission</div>
                        <div className="text-white font-semibold">{selectedCar.transmission}</div>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-gray-400 text-sm">Body Type</div>
                        <div className="text-white font-semibold">{selectedCar.bodyType}</div>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-gray-400 text-sm">Condition</div>
                        <div className="text-white font-semibold">{selectedCar.condition}</div>
                      </div>
                    </div>

                    {/* Features */}
                    {selectedFeatures.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedFeatures.map((feature, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-300">
                              <div className="w-2 h-2 bg-gold rounded-full mr-2"></div>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    <div className="bg-gray-800 p-4 rounded-lg mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-300">
                          <FiMapPin className="mr-2 text-gold" />
                          {formatLocation(selectedCar.location)}
                        </div>
                        {selectedCar.contactPhone && (
                          <div className="flex items-center text-gray-300">
                            <FiPhone className="mr-2 text-gold" />
                            {selectedCar.contactPhone}
                          </div>
                        )}
                        {selectedCar.contactEmail && (
                          <div className="flex items-center text-gray-300">
                            <FiMail className="mr-2 text-gold" />
                            {selectedCar.contactEmail}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleInquiry(selectedCar._id)}
                        className="flex-1 bg-gold text-black py-3 px-6 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                      >
                        Contact Seller
                      </button>
                      {selectedCar.contactPhone && (
                        <a
                          href={`tel:${selectedCar.contactPhone}`}
                          className="bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center"
                        >
                          <FiPhone className="mr-2" />
                          Call
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedCar.description && (
                <div className="mt-8 pt-8 border-t border-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                  <p className="text-gray-300 leading-relaxed">{selectedCar.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarShop;