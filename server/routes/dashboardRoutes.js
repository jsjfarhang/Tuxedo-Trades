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
    temp.forEach( share => { 
        stocks.forEach(stock => {
            if(stock.ticker == share.ticker){
                portfolio.push({
                    "ticker": share.ticker,
                    "company": stock.company,
                    "sharesOwned": share.sharesOwned,
                    "price": stock.history.at(-1)?.price,
                    "volume": stock.volume,
                    "marketCap": (stock.volume * (stock.history.at(-1)?.price)),
                });
            };
        });
    });   
    res.render('dashboard', { user, portfolio, stocks });
});

module.exports = router;