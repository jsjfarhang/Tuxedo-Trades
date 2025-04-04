const mongoose = require('mongoose');

const marketsSchema = new mongoose.Schema({
  openTime: { type: String, required: true },
  closeTime: { type: String, required: true },
  openDays: { type: [String], default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]},
  holidays: { type: [String], default: ["2025/01/01", "2025/12/25", "2025/07/04"]},
  timeZone: { type: String, default: "America/New_York" }
}, { versionKey: false });

const Markets = mongoose.model('markets', marketsSchema);
module.exports = Markets;
