const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  admin: { type: Boolean, default: false },
  bankAccount: {
    bankName: { type: String, required: true, default: "Bank of ASU" },
    balance: { type: Number, required: true }
  },
  cashAccount: {
    balance: { type: Number, default: 0 }
  },
  portfolio: [
    {ticker: { type: String, default: null },
    sharesOwned: { type: Number, default: 0 }}
  ]
}, { versionKey: false });

const User = mongoose.model('User', userSchema);
module.exports = User;
