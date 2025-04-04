const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware');
const { User } = require('../../database');

// transfer page (deposit/withdraw)
router.get('/:username/transfer', authenticateToken, async (req, res) => {
    const user = req.user;
    if (!user) return res.redirect(`/`);
    res.render('transfer', { user });
});

// transfer cash amount
router.post('/transfer', async (req, res) => {
  try {
    const { username, amount, fromAccount, toAccount } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found or bank account does not exist' });
    if (fromAccount === 'bankAccount' && user.bankAccount.balance < amount) {
      return res.status(400).json({ error: 'Insufficient funds in bank account' });
    }
    if (fromAccount === 'cashAccount' && user.cashAccount.balance < amount) {
      return res.status(400).json({ error: 'Insufficient funds in cash account' });
    }
    if (fromAccount === 'bankAccount' && toAccount === 'cashAccount') {
      user.bankAccount.balance -= amount;
      user.cashAccount.balance += amount;
    }
    if (fromAccount === 'cashAccount' && toAccount === 'bankAccount') {
      user.cashAccount.balance -= amount;
      user.bankAccount.balance += amount;
    }
    await user.save();
    res.status(200).json({ message: 'Transfer successful', user });
  } catch (error) {
    res.status(400).json({ error: 'Error processing transfer', message: error.message });
  }
});

module.exports = router;