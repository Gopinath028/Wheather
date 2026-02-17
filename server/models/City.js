/**
 * City Model - MongoDB Schema
 * Stores user's saved cities for weather tracking
 */

const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    // City name (required)
    name: {
      type: String,
      required: [true, 'City name is required'],
      trim: true
    },

    // Country code (e.g., 'US', 'GB')
    country: {
      type: String,
      trim: true,
      uppercase: true
    },

    // Geographic coordinates
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lon: {
        type: Number,
        required: true
      }
    },

    // Unique identifier to prevent duplicates
    cityId: {
      type: String,
      sparse: true
    },

    // User-defined order for display
    order: {
      type: Number,
      default: 0
    },

    // Last updated timestamp
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'cities'
  }
);

// Create compound index for faster queries
citySchema.index({ name: 1, country: 1 });

// Create unique index for cityId
citySchema.index({ cityId: 1 }, { unique: true });

// Virtual field for display name
citySchema.virtual('displayName').get(function () {
  return this.country ? `${this.name}, ${this.country}` : this.name;
});

// Ensure virtuals are included in JSON output
citySchema.set('toJSON', { virtuals: true });
citySchema.set('toObject', { virtuals: true });

// Pre-save middleware to update lastUpdated
citySchema.pre('save', function (next) {
  this.lastUpdated = Date.now();
  next();
});

// Static method to find city by name
citySchema.statics.findByName = function (name, country = null) {
  const query = { name: new RegExp(`^${name}$`, 'i') };
  if (country) {
    query.country = country.toUpperCase();
  }
  return this.findOne(query);
};

// Instance method to update coordinates
citySchema.methods.updateCoordinates = function (lat, lon) {
  this.coordinates.lat = lat;
  this.coordinates.lon = lon;
  this.lastUpdated = Date.now();
  return this.save();
};

const City = mongoose.model('City', citySchema);

module.exports = City;
