const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware');
const { Stock } = require('../../database');

// dashboard page
router.get('/:username/dashboard', authenticateToken, async (req, res) => {
    const user = req.user;
    if (!user) return res.redirect('/');
    const temp = await user.portfolio;
    const stocks = await Stock.find();
    const portfolio = [];
    let totalPortfolioValue = 0;
    temp.forEach( share => { 
        stocks.forEach(stock => {
            if(stock.ticker == share.ticker){
                const lastPrice = stock.history.at(-1)?.price;
                const stockMarketValue = (stock.volume * lastPrice);
                portfolio.push({
                    "ticker": share.ticker,
                    "company": stock.company,
                    "sharesOwned": share.sharesOwned,
                    "price": lastPrice,
                    "volume": stock.volume,
                    "marketCap": stockMarketValue,
                });
                totalPortfolioValue += stockMarketValue * share.sharesOwned;
            };
        });
    });   
    res.render('dashboard', { user, portfolio, stocks, totalPortfolioValue });
});

module.exports = router;