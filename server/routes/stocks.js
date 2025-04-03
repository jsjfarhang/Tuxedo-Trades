const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware');
const { Stock } = require('../../database');

// trading page
router.get('/:username/trading', authenticateToken, async (req, res) => {
    const user = req.user;
    if (!user) return res.redirect(`/`);
    const stocks = await Stock.find();
    res.render('trading', { user, stocks });
});

// create new stock
router.post('/stocks', async (req, res) => {
  try {
    const { ticker, company, volume, marketCap, history } = req.body;
    const existingStock = await Stock.findOne({ 
      $or: [{ ticker }, { company }] 
    });
    if (existingStock) {
      return res.status(400).json({ error: 'Ticker or company already exists.' });
    }
    const newStock = new Stock({ ticker, company, volume, marketCap, history });
    await newStock.save();
    res.status(201).json(newStock);
  } catch (error) {
    res.status(400).json({ error: 'Error creating stock', message: error.message });
  }
});

module.exports = router;