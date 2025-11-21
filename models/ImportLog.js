const mongoose = require('mongoose');

const importLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  fileName: { type: String, required: true },
  totalFetched: { type: Number, default: 0 },
  totalImported: { type: Number, default: 0 },
  newJobs: { type: Number, default: 0 },
  updatedJobs: { type: Number, default: 0 },
  failedJobs: { type: Number, default: 0 },
  failedReasons: [{ type: String }], 
  sourceUrl: { type: String, required: true }, 
  externalId: { type: String, required: true, unique: true }, 
});

module.exports = mongoose.model('ImportLog', importLogSchema);
