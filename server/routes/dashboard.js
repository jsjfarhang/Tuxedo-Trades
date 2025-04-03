const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware');

// dashboard page
router.get('/:username/dashboard', authenticateToken, async (req, res) => {
    const user = req.user;
    if (!user) return res.redirect('/');
    res.render('dashboard', { user });
});

module.exports = router;