const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware');

// help page
router.get('/help', authenticateToken, async (req, res) => {
    const user = req.user;
    res.render('help', { user });
});

// about page
router.get('/about', authenticateToken, async (req, res) => {
    const user = req.user;
    res.render('about', { user });
});

module.exports = router;