const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware');
const { Transaction } = require('../../database');

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
    const { timestamp, type, ticker, quantity, userId, price } = req.body;
    if (!timestamp || !type || !ticker || quantity == null || price == null) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const newTransaction = new Transaction({
      timestamp,
      type,
      ticker,
      quantity,
      userId,
      price,
    });
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ error: 'Error creating transaction', message: error.message });
  }
});

module.exports = router;