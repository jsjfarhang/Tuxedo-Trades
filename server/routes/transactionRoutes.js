const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware');
const { sanitizeInput } = require('../sanitize');
const { Transaction, User, Stock, Markets } = require('../../database');

// trading history page
router.get('/:username/history', authenticateToken, async (req, res) => {
    const user = req.user;
    if (!user) return res.redirect('/');
    const transactions = await Transaction.find({ userId: user._id });
    res.render('history', { user, transactions });
});

// create new transaction
router.post('/transactions', async (req, res) => {
  try {
    const { type, quantity, username, ticker } = req.body;
    if (!sanitizeInput([type, quantity, username, ticker])) {
      return res.status(400).json({ message: "Invalid input detected" });
    }
    if (!type || !ticker || quantity == (null || "")) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (type !== 'buy' && type !== 'sell') {
      return res.status(400).json({ error: 'buySell Error.' });
    }
    let result = await executeTransaction(type, quantity, username, ticker);
    const newTransaction = new Transaction({ ...result });
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

function isMarketOpen(now, marketSettings) {
  const day = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = now.toTimeString().slice(0, 5);
  const isOpenTime = currentTime >= marketSettings.openTime && currentTime <= marketSettings.closeTime;
  const isOpenDay = marketSettings.openDays.includes(day);
  const formattedDate = now.toISOString().split('T')[0].replace(/-/g, '/');
  const isHoliday = marketSettings.holidays.includes(formattedDate);
  return isOpenTime && isOpenDay && !isHoliday;
}

// transaction logic
async function executeTransaction(type, quantity, username, ticker) {
  const marketSettings = await Markets.findOne();
  const now = new Date();
  if (!isMarketOpen(now, marketSettings)) {
    throw new Error('Market is currently closed.');
  }
  const user = await User.findOne({ username });
  const stock = await Stock.findOne({ ticker });
  const price = stock.history.at(-1)?.price;
  type = type.toUpperCase();
  quantity = parseInt(quantity);
  if (isNaN(quantity) || quantity <= 0) {
    throw new Error('Amount must be a whole number greater than 0.');
  }
  if (price == null) {
    throw new Error('No price data available for this stock.');
  }
  const cost = price * quantity;
  if (type === 'BUY' && stock.volume < quantity) {
    throw new Error('Not enough available stock.');
  }
  if (type === 'BUY' && user.cashAccount.balance < cost) {
    throw new Error('Insufficient funds.');
  }
  if (type === 'BUY') {
    const index = user.portfolio.findIndex(item => item.ticker === ticker);
    if (index !== -1) {
      user.portfolio[index].sharesOwned += quantity;
    } else {
      user.portfolio.push({ ticker, sharesOwned: quantity });
    }
    user.cashAccount.balance -= cost;
    stock.volume -= quantity;
  }
  if (type === 'SELL') {
    const index = user.portfolio.findIndex(item => item.ticker === ticker);
    if (index === -1 || user.portfolio[index].sharesOwned < quantity) {
      throw new Error('Not enough shares to sell.');
    }
    user.portfolio[index].sharesOwned -= quantity;
    if (user.portfolio[index].sharesOwned === 0) {
      user.portfolio.splice(index, 1);
    }
    user.cashAccount.balance += cost;
    stock.volume -= quantity;
  }
  await user.save();
  await stock.save();
  const timestamp = new Date();
  return { timestamp, type, ticker, quantity, userId: user._id, price };
}

// transaction page
router.get('/:username/trading/:ticker', authenticateToken, async (req, res) => {
  const user = req.user;
  const { ticker } = req.params;
  const { action } = req.query;
  if (!user) return res.redirect('/');
  if (ticker.length > 4) return res.status(404).send('Invalid ticker');
  if (action !== 'buy' && action !== 'sell') return res.status(404).send('Invalid action type');
  const stock = await Stock.findOne({ ticker });
  if (!stock) return res.status(404).send('Stock not found');
  res.render('transaction', { user, stock, action });
});

module.exports = router;