const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware');
const { User } = require('../../database');

// login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    // add bycrypt library later?
    const accessToken = jwt.sign({ username: user.username, id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'live',
      sameSite: 'Strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });
    res.json({ redirectUrl: `/${user.username}/dashboard` });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in', message: error.message });
  }
});

// logout user
router.get('/logout', (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'live',
      sameSite: 'Strict',
    });
    res.redirect('/');
});

// signup page
router.get('/signup', authenticateToken, async (req, res) => {
    const user = req.user;
    res.render('signup', { user });
});

// create new user
router.post('/users', async (req, res) => {
  try {
    const { fname, lname, username, password, email, bankName, balance } = req.body;
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    const newUser = new User({
      fname: fname,
      lname: lname,
      username: username,
      password: password,
      email: email,
      bankAccount: {
        bankName: bankName,
        balance: balance
      },
      cashAccount: {
        balance: 0
      },
      portfolio: {
        ticker: null,
        sharesOwned: 0
      }
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: 'Error creating user', message: error.message });
  }
});

module.exports = router;