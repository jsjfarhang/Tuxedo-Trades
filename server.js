// Load environment variables
require('dotenv').config();

// Core module imports
const express = require('express');

// Database connection
const { connectDb } = require('./database');

// Express app setup
const app = express();
const PORT = process.env.PORT;

// Middleware imports
const cookieParser = require('cookie-parser');
const { updateStockPrice } = require('./server/stockUpdater');
const { router: marketRoutes, loadMarket } = require('./server/routes/marketRoutes');

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

async function testPriceUpdate(x) {
  for (let i = 0; i < x; i++) {
      await updateStockPrice();
  }
}
testPriceUpdate(3);

// Routes
const indexRoutes = require('./server/routes/indexRoutes');
const authHandlerRoutes = require('./server/routes/authRoutes');
const dashboardRoutes = require('./server/routes/dashboardRoutes');
const transactionsRoutes = require('./server/routes/transactionRoutes');
const transferRoutes = require('./server/routes/transferRoutes');
const adminRoutes = require('./server/routes/adminRoutes');
const stocksRoutes = require('./server/routes/stockRoutes');

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