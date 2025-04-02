const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  ticker: { type: String, required: true },
  company: { type: String, required: true },
  currentValue: { type: Number, required: true },
  volume: { type: Number, required: true },
  marketCap: { type: Number, required: true }
}, { versionKey: false });

const Stock = mongoose.model('Stock', stockSchema);
module.exports = Stock;
