const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware');
const { Stock, User } = require('../../database');

// random price generator (initializes price)
function priceGenerator() {
  let min = 1, max = 5000;
  let randomPrice = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomPrice;
}

// create new stock
router.post('/stocks', async (req, res) => {
  try {
    const { ticker, company, volume } = req.body;
    const existingStock = await Stock.findOne({ 
      $or: [{ ticker }, { company }] 
    });
    if (existingStock) {
      return res.status(400).json({ error: 'Ticker or company already exists.' });
    }
    const price = Number(priceGenerator());
    const marketCap = Number(price * volume);
    const timestamp = new Date();
    const history = [{ timestamp, price }];
    const newStock = new Stock({ ticker, company, volume, marketCap, history });
    await newStock.save();
    res.status(201).json(newStock);
  } catch (error) {
    res.status(400).json({ error: 'Error creating stock', message: error.message });
  }
});

// get daily opening price, high, low, % change
router.post('/stocks/day-change', async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    const result = [];
    for (let stock of user.portfolio) {
      const stockData = await Stock.findOne({ ticker: stock.ticker });
      if (stockData && stockData.history.length > 0) {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        const todayHistory = stockData.history.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= startOfDay && entryDate <= endOfDay;
        });
        if (todayHistory.length === 0) continue;
        const currentPrice = todayHistory.at(-1).price;
        const openingPrice = todayHistory[0].price;
        const highPrice = Math.max(...todayHistory.map(entry => entry.price));
        const lowPrice = Math.min(...todayHistory.map(entry => entry.price));
        const percentChange = ((currentPrice - openingPrice) / openingPrice) * 100;
        result.push({
          ticker: stock.ticker,
          openingPrice,
          highPrice,
          lowPrice,
          percentChange: percentChange.toFixed(2)
        });
      }
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching opening price, high, low and percent change for today.' });
  }
});

// trading page
router.get('/:username/trading', authenticateToken, async (req, res) => {
  const user = req.user;
  if (!user) return res.redirect('/');
  const stocks = await Stock.find();
  res.render('trading', { user, stocks });
});

module.exports = router;