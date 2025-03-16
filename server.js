require('dotenv').config();
const express = require('express');
const { connectDb, User, Transaction, Stock } = require('./database');
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


/* middleware */

const verifyToken = promisify(jwt.verify);
const authenticateToken = async (req, res, next) => {
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

app.post('/login', async (req, res) => { // login user
  try { // add code to verify no duplicate users
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
  try { // add code to make sure there are no duplicate users
    const { fname, lname, username, password, email, admin, bankName, bankBalance } = req.body;
    const newUser = new User({ fname, lname, username, password, email, admin, bankName, bankBalance });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: 'Error creating user', message: error.message });
  }
});

app.post('/transactions', async (req, res) => { // create new transaction
  try { // add code to verify no duplicate transactions
    const { transId, buySell, ticker, quantity, userId, price } = req.body;
    const newTransaction = new Transaction({
      transId,
      buySell,
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
  try { // add code to verify no duplicate stocks
    const { ticker, currentValue, volume, marketCap } = req.body;
    const newStock = new Stock({ ticker, currentValue, volume, marketCap });
    await newStock.save();
    res.status(201).json(newStock);
  } catch (error) {
    res.status(400).json({ error: 'Error creating stock', message: error.message });
  }
});

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

app.get('/:username/trading', authenticateToken, async (req, res) => {
  const user = req.user;
  if (!user) return res.redirect(`/${user.username}/dashboard`);
  res.render(__dirname + '/views/trading.ejs', { user });
});

app.get('/:username/transfer', authenticateToken, async (req, res) => {
  const user = req.user;
  if (!user) return res.redirect(`/${user.username}/dashboard`);
  res.render(__dirname + '/views/transfer.ejs', { user });
});

app.get('/:username/transactions', authenticateToken, async (req, res) => { // user transaction history
  const user = req.user;
  const transactions = await Transaction.find({ userId: user._id });
  res.json(transactions);
  if (!user) return res.redirect(`/${user.username}/dashboard`);
  res.render(__dirname + '/views/transactions.ejs', { user });
});

app.get('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'live',
    sameSite: 'Strict',
  });
  res.redirect('/');
});
