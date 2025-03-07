require('dotenv').config();
const express = require('express');
const { connectDb, User, Transaction, Stock } = require('./database');
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.static('public'));

connectDb();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


/* routes */

app.post('/users', async (req, res) => { // create new user
  try { // add code to make sure there are no duplicate users
    const { username, password, email, admin } = req.body;
    const newUser = new User({ username, password, email, admin });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: 'Error creating user', message: error.message });
  }
});

app.post('/login', async (req, res) => { // authenticate user
  try { // add code to verify no duplicate users
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.password === password) { // add bycrypt library later?
      res.status(200).json({ message: 'Login successful', user });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.log("4")
    res.status(500).json({ error: 'Error logging in', message: error.message });
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

app.get('/', async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  res.render(__dirname + '/views/login.ejs', { user });
});

app.get('/help', async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  res.render(__dirname + '/views/help.ejs', { user });
});

app.get('/signup', async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  res.render(__dirname + '/views/signup.ejs', { user });
});

app.get('/about', async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  res.render(__dirname + '/views/about.ejs', { user });
});

app.get('/:username/dashboard', async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).send("User not found");
  }
  res.render(__dirname + '/views/dashboard.ejs', { user });
});

app.get('/:username/trading', async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).send("User not found");
  }
  res.render(__dirname + '/views/trading.ejs', { user });
});

app.get('/:username/transfer', async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).send("User not found");
  }
  res.render(__dirname + '/views/transfer.ejs', { user });
});

app.get('/:username/transactions', async (req, res) => { // user transaction history
  // add code to require authentication when accessing
  const { username } = req.params;
  const user = await User.findOne({ username });
  const transactions = await Transaction.find({ userId: req.params.userId });
  res.json(transactions);
  if (!user) {
    return res.status(404).send("User not found");
  }
  res.render(__dirname + '/views/transactions.ejs', { user });
});
