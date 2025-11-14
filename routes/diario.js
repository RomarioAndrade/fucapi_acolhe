var express = require('express');
var router = express.Router();
const authenticateToken = require('../middleware/auth');
const diarioModel = require("../model/diarioModel");

router.post('/api/diario/novo', authenticateToken, async (req, res) => {
    try {
        const resultado = await diarioModel.createDiario(req.body,req.user.id);
        res.json(resultado);
    } catch (error) {
        console.error('Erro ao salvar questionário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.get('/dashboard/diario-emocoes',authenticateToken,(req,res)=>{
    res.render('diario-emocoes',{user: req.user});
});

router.get('/api/diarios',authenticateToken,async (req, res) => {
    try {
        const resultado = await diarioModel.getDiarios(req.user.id);
        res.json(resultado);
    }catch(error) {
        console.error('Erro ao recuperar diarios de emoções:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;