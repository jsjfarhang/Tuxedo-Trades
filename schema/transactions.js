const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  ticker: { type: String, required: true },
  quantity: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true }
}, { versionKey: false });
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
