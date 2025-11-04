var express = require('express');
var router = express.Router();
const agendaModel = require('../model/agendaModel');
const authenticateToken = require('../middleware/auth');

router.get('/dashboard/agenda', authenticateToken, async (req, res) => {
    //console.log(req.user);
    res.render('agenda', {user: req.user});
});

router.get('/task/:data', authenticateToken, async (req, res) => {
    console.log(req.params);
    try {
        const userId = req.user.id;
        const {data} = req.params;
        const tarefas = await agendaModel.findTarefasByData(userId, data);

        //pode não ter nenhuma tarefa
        if (tarefas) {
            res.json(tarefas);
        } else {
            res.json({});
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.get('/tarefa/:id', authenticateToken, async (req, res) => {
    try {
        const {id} = req.params;

        const tarefa = await agendaModel.findTarefaById(id);
        console.log(id);
        //pode não ter nenhuma tarefa
        if (tarefa) {
            res.json(tarefa);
        } else {
            res.json({});
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.post('/task', authenticateToken, async (req, res) => {
    const {titulo, descricao, data_inicio, taskType} = req.body;
    try {
        let categoriaId = await agendaModel.findCategoriaByName(req.user.id, taskType);
        if (!categoriaId) {
            categoriaId = await agendaModel.createCategoria({id_usuario: req.user.id, nome: taskType});
        }

        const id = await agendaModel.createTarefa({
            id_usuario: req.user.id, id_categoria: categoriaId.id,
            titulo: titulo, descricao: descricao, data_inicio: data_inicio
        });
        console.log("ID: "+id);
        const tarefa = await agendaModel.findTarefaById(id);

        res.status(201).json({tarefa});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.post('/task/remove/:id', authenticateToken, async (req, res) => {
    try {
        const {id} = req.params;
        const result = await agendaModel.removeTarefaById(id);
        res.status(201).json({result});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
})

router.post('/task/update', authenticateToken, async (req, res) => {
    const {titulo, descricao, data_inicio, taskType} = req.body;
    try {
        let categoriaId = await agendaModel.findCategoriaByName(req.user.id, taskType);
        if (!categoriaId) {
            categoriaId = await agendaModel.createCategoria({id_usuario: req.user.id, nome: taskType});
        }

        const id = await agendaModel.updateTarefa({
            id_usuario: req.user.id, id_categoria: categoriaId.id,
            titulo: titulo, descricao: descricao, data_inicio: data_inicio
        });
        console.log("ID: "+id);
        const tarefa = await agendaModel.findTarefaById(id);

        res.status(201).json({tarefa});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
});

module.exports = router;