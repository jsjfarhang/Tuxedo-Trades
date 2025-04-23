const cron = require('node-cron');
const { Stock } = require('../database');

// random price generator (after price has been initialized)
function generateNewPrice(currentPrice) {
    const changePercent = (Math.random() * 0.05 + 0.02); // 2-5% change
    const change = Math.random() > 0.5 ? 1 : -1; // randomly increase or decrease
    const newPrice = currentPrice * (1 + change * changePercent);
    return Math.round(newPrice);
}

// update stock price with generated price
async function updateStockPrice() {
  const stocks = await Stock.find();
  for (const stock of stocks) {
    const lastPrice = stock.history[stock.history.length - 1]?.price;
    if (lastPrice) {
      const newPrice = generateNewPrice(lastPrice);
      stock.history.push({ timestamp: new Date(), price: newPrice });
      if (stock.history.length > 10) {
        stock.history.shift();
      }
      await stock.save();
      console.log(`Updated ${stock.ticker} price: ${newPrice}`);
    }
  }
}

// updates price hourly
cron.schedule('0 * * * *', async () => await updateStockPrice());

module.exports = { updateStockPrice };