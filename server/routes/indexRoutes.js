const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware');

// login page
router.get('/', authenticateToken, async (req, res) => {
    const user = req.user;
    if (user) return res.redirect(`/${user.username}/dashboard`);
    res.render('login', { user });
});

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