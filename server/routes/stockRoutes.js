const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware');
const { Stock } = require('../../database');

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

// trading page
router.get('/:username/trading', authenticateToken, async (req, res) => {
  const user = req.user;
  if (!user) return res.redirect('/');
  const stocks = await Stock.find();
  res.render('trading', { user, stocks });
});

module.exports = router;