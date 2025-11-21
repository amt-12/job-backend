const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  description: { type: String },
  link: { type: String },
  category: { type: String },
  type: { type: String },
  region: { type: String },
  sourceUrl: { type: String, required: true }, // The API URL
  externalId: { type: String, required: true, unique: true }, // Unique ID from API
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastBuildDate: { type: Date },
});

module.exports = mongoose.model('Job', jobSchema);
