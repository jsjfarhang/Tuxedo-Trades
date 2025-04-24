const express = require('express');
const router = express.Router();
const { sanitizeInput } = require('../sanitize');
const { Markets } = require('../../database');

let cachedMarket = null;

// load market hours/schedule from db
async function loadMarket() {
  cachedMarket = await Markets.findOne();
  if (!cachedMarket) {
    cachedMarket = await Markets.create({
          openTime: "09:30",
          closeTime: "16:00",
          openDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          holidays: ["2025/01/01", "2025/12/25", "2025/07/04"]
      });
  }
}

// grab market settings from db
router.get('/market-settings', async (req, res) => {
    if (!cachedMarket) await loadMarket();
    res.json(cachedMarket);
});

// update market hours
router.post('/update-market-hours', async (req, res) => {
    const { openTime, closeTime } = req.body;
    if (!sanitizeInput([openTime, closeTime])) {
        return res.status(400).json({ message: "Invalid input detected" });
    }
    await Markets.findOneAndUpdate({}, { openTime, closeTime });
    cachedMarket.openTime = openTime;
    cachedMarket.closeTime = closeTime;
    res.json({ success: true, message: "Market hours updated" });
});

// update market schedule
router.post('/update-market-schedule', async (req, res) => {
    const { openDays, holidays } = req.body;
    if (!sanitizeInput([openDays, holidays])) {
        return res.status(400).json({ message: "Invalid input detected" });
    }
    await Markets.findOneAndUpdate({}, { openDays, holidays });
    cachedMarket.openDays = openDays;
    cachedMarket.holidays = holidays;
    res.json({ success: true, message: "Market schedule updated" });
});

module.exports = { router, loadMarket };