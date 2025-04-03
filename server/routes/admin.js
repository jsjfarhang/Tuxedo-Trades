const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware');

// admin page
router.get('/:username/admin', authenticateToken, async (req, res) => {
    const user = req.user;
    if (!user.admin) return res.redirect('/');
    res.render('admin', { user });
});

module.exports = router;