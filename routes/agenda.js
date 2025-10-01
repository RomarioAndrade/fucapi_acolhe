var express = require('express');
var router = express.Router();

router.get('/minha-agenda', (req, res) => {
    console.log("teste");
    res.render('agenda',{title: 'FUCAPI Acolhe - Dashboard', message: ''});
});

module.exports = router;