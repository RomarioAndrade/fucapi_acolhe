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
        const tarefas = await agendaModel.findTarefasByData(userId,data);

        //pode não ter nenhuma tarefa
        if (tarefas) {
            res.json(tarefas);
        }else{
            res.json({});
        }

    }catch(err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.post('/task', authenticateToken, async (req, res) => {
    const {titulo,descricao,data_inicio,taskType} = req.body;
    try {
        let categoriaId = await agendaModel.findCategoriaByName(req.user.id,taskType);
        if (!categoriaId) {
            categoriaId = await agendaModel.createCategoria({id_usuario: req.user.id,nome:taskType});
        }

        console.log(categoriaId.id);

        const tarefa = await agendaModel.createTarefa({id_usuario:req.user.id,id_categoria:categoriaId.id,
            titulo:titulo,descricao:descricao,data_inicio:data_inicio});
        res.status(201).json({
            id: tarefa.id,
            descricao: tarefa.descricao,
        });

    }catch(err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }

});

module.exports = router;