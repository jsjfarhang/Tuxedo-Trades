require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { connectDb, User, Transaction, Stock, Markets } = require('./database');
const app = express();
const PORT = process.env.PORT;
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

connectDb();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

let cachedMarket = null;
async function loadMarket() {
  cachedMarket = await Markets.findOne();
  console.log("cachedMarket", cachedMarket)
  if (!cachedMarket) {
    cachedMarket = await Markets.create({
          openTime: "09:30",
          closeTime: "16:00",
          openDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          holidays: ["2025/01/01", "2025/12/25", "2025/07/04"]
      });
  }
}
loadMarket();


/* middleware */

const verifyToken = promisify(jwt.verify);
const authenticateToken = async (req, res, next) => { // verify user
  const token = req.cookies.token;
  if (!token) return next();
  const x = await verifyToken(token, process.env.JWT_SECRET);
  const user = await User.findById(x.id);
  if (!user) return next();
  req.user = user;
  req.token = token;
  next();
};


/* routes */

app.get('/', authenticateToken, async (req, res) => {
  const user = req.user;
  if (user) res.redirect(`/${user.username}/dashboard`);
  res.render(__dirname + '/views/login.ejs', { user });
});

app.get('/help', authenticateToken, async (req, res) => {
  const user = req.user;
  res.render(__dirname + '/views/help.ejs', { user });
});

app.get('/signup', authenticateToken, async (req, res) => {
  const user = req.user;
  res.render(__dirname + '/views/signup.ejs', { user });
});

app.get('/about', authenticateToken, async (req, res) => {
  const user = req.user;
  res.render(__dirname + '/views/about.ejs', { user });
});

app.get('/:username/dashboard', authenticateToken, async (req, res) => {
  const user = req.user;
  if (!user) return res.redirect('/');
  res.render(__dirname + '/views/dashboard.ejs', { user });
});

app.get('/:username/history', authenticateToken, async (req, res) => {
  const user = req.user;
  if (!user) return res.redirect('/');
  const transactions = await Transaction.find({ userId: user._id });
  res.render(__dirname + '/views/history.ejs', { user, transactions });
});

app.get('/:username/trading', authenticateToken, async (req, res) => {
  const user = req.user;
  if (!user) return res.redirect(`/`);
  const stocks = await Stock.find();
  res.render(__dirname + '/views/trading.ejs', { user, stocks });
});

app.get('/:username/transfer', authenticateToken, async (req, res) => {
  const user = req.user;
  if (!user) return res.redirect(`/`);
  res.render(__dirname + '/views/transfer.ejs', { user });
});

app.get('/:username/admin', authenticateToken, async (req, res) => {
  const user = req.user;
  if (!user.admin) return res.redirect(`/`);
  res.render(__dirname + '/views/admin.ejs', { user });
});

app.get('/market-settings', async (req, res) => {
  if (!cachedMarket) await loadMarket();
  res.json(cachedMarket);
});

app.get('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'live',
    sameSite: 'Strict',
  });
  res.redirect('/');
});

app.post('/login', async (req, res) => { // login user
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
      maxAge: 24 * 60 * 60 * 1000
    });
    res.json({ redirectUrl: `/${user.username}/dashboard` });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in', message: error.message });
  }
});

app.post('/users', async (req, res) => { // create new user
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
      }
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: 'Error creating user', message: error.message });
  }
});

app.post('/transactions', async (req, res) => { // create new transaction
  try {
    const { timestamp, type, ticker, quantity, userId, price } = req.body;
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

app.post('/stocks', async (req, res) => { // create new stock
  try {
    const { ticker, company, currentValue, volume, marketCap } = req.body;
    const existingStock = await Stock.findOne({ 
      $or: [{ ticker }, { company }] 
    });
    if (existingStock) {
      return res.status(400).json({ error: 'Ticker or company already exists.' });
    }
    const newStock = new Stock({ ticker, company, currentValue, volume, marketCap });
    await newStock.save();
    res.status(201).json(newStock);
  } catch (error) {
    res.status(400).json({ error: 'Error creating stock', message: error.message });
  }
});

app.post('/update-market-hours', async (req, res) => {
  const { openTime, closeTime } = req.body;
  await Markets.findOneAndUpdate({}, { openTime, closeTime });
  cachedMarket.openTime = openTime;
  cachedMarket.closeTime = closeTime;
  res.json({ success: true, message: "Market hours updated" });
  console.log("cachedMarket", cachedMarket)
});

app.post('/update-market-schedule', async (req, res) => {
  const { openDays, holidays } = req.body;
  await Markets.findOneAndUpdate({}, { openDays, holidays });
  cachedMarket.openDays = openDays;
  cachedMarket.holidays = holidays;
  res.json({ success: true, message: "Market schedule updated" });
  console.log("cachedMarket", cachedMarket)
});

app.post('/transfer', async (req, res) => { // transfer cash amount
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
