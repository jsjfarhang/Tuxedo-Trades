const { mongoose } = require('mongoose');
const User = require('./schema/users');
const Transaction = require('./schema/transactions');
const Stock = require('./schema/stocks');
const Markets = require('./schema/markets');

let db = process.env.MONGO_URI + 'tuxedo_trades';

const connectDb = async () => {
  try {
    await mongoose.connect(db);
    console.log('Connected to the database');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
};

module.exports = { connectDb, User, Transaction, Stock, Markets };