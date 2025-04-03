// Load environment variables
require('dotenv').config();

// Core module imports
const express = require('express');
const mongoose = require('mongoose');

// Database connection
const { connectDb } = require('./database');

// Express app setup
const app = express();
const PORT = process.env.PORT;

// Middleware imports
const cookieParser = require('cookie-parser');
const { authenticateToken } = require('./server/middleware');
const updateStockPrice = require('./server/updater');
const { router: marketRoutes, loadMarket } = require('./server/routes/market');

app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

// View engine configuration
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Connect to database
connectDb();

// Run stock market updater
loadMarket();

//async function testPriceUpdate() { await updateStockPrice(); }
//testPriceUpdate();

// Routes
app.get('/', authenticateToken, async (req, res) => {
  const user = req.user;
  if (user) res.redirect(`/${user.username}/dashboard`);
  res.render(__dirname + '/views/login.ejs', { user });
});

const indexRoutes = require('./server/routes/index');
const authHandlerRoutes = require('./server/routes/authHandler');
const dashboardRoutes = require('./server/routes/dashboard');
const transactionsRoutes = require('./server/routes/transactions');
const transferRoutes = require('./server/routes/transfer');
const adminRoutes = require('./server/routes/admin');
const stocksRoutes = require('./server/routes/stocks');

app.use('/', indexRoutes);
app.use('/', authHandlerRoutes);
app.use('/', dashboardRoutes);
app.use('/', transactionsRoutes);
app.use('/', transferRoutes);
app.use('/', adminRoutes);
app.use('/', stocksRoutes);
app.use('/', marketRoutes);

// Boot up the server after all routes and middleware are set
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});