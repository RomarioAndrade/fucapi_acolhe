var express = require('express');
var router = express.Router();
const questionarioModel = require('../model/questionarioModel');
const authenticateToken = require('../middleware/auth');


router.get('/questionario', authenticateToken, async (req, res) => {
    res.render('questionario',{user: req.user});
});


router.post('/api/questionario', authenticateToken, async (req, res) => {
    try {
        const resultado = await questionarioModel.salvarQuestionario(req.body,req.user.id);
        res.json(resultado);
    } catch (error) {
        console.error('Erro ao salvar questionário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.get('/api/perguntas', authenticateToken, async (req, res) => {
    try{
        const perguntas = await questionarioModel.obterPerguntas();
        if (perguntas.length > 0){
            console.log(perguntas.length);
            for (let pergunta of perguntas) {
                pergunta.respostas = await questionarioModel.obterRespostas_padrao(pergunta.id);
                console.log(pergunta.respostas.length);
            }

        }
        res.json(perguntas);
    }catch (error) {
        console.error("Erro ao obter perguntas",error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.get('/obrigado', authenticateToken, async (req, res) => {
    res.render('obrigado');
});

module.exports = router;