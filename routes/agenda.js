var express = require('express');
var router = express.Router();
const agendaModel = require('../model/agendaModel');
const authenticateToken = require('../middleware/auth');

router.get('/dashboard/agenda',authenticateToken, async (req, res) => {
    //console.log(req.user);
    res.render('agenda',{user: req.user});
});

router.get('/task/:data', authenticateToken, async (req, res) => {
    console.log(req.params);
    try {
        const userId = req.user.id;
        const {data} = req.params;
        const tarefas = await agendaModel.findTarefasByData(userId,'2025-10-28');
        console.log(tarefas);
        res.json(tarefas);

    }catch(err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }

});

module.exports = router;