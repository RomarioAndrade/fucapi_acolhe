var express = require('express');
var router = express.Router();
const authenticateToken = require('../middleware/auth');

router.get('/dashboard/agenda',authenticateToken, async (req, res) => {
    //console.log(req.user);
    res.render('agenda',{user: req.user});
});

module.exports = router;