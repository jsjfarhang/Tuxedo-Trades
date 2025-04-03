const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  ticker: { type: String, required: true, unique: true },
  company: { type: String, required: true },
  volume: { type: Number, required: true },
  marketCap: { type: Number, required: true },
  history: [
    {
      timestamp: { type: Date, default: Date.now },
      price: { type: Number, required: true }
    }
  ]
}, { versionKey: false });

const Stock = mongoose.model('Stock', stockSchema);
module.exports = Stock;
