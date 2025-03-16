const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  admin: { type: Boolean, default: false },
  bankAccount: {
    bankName: { type: String },
    bankBalance: { type: Number}
  },
  cashAccount: {
    balance: {type: Number}
  }
});
const User = mongoose.model('User', userSchema);

module.exports = User;
