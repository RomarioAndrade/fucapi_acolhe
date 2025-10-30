const { createConnection } = require('../database/db');

class agendaModel {

    //Buscar todas as tarefas em uma data especifica
    async findTarefasByData(userId,data) {
        const connection = await createConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM tarefas WHERE data_inicio LIKE ? AND id_usuario = ?',
            [`${data}%`,userId]
        );
        await connection.end();
        return rows[0];
    }

    // Buscar todas as categorias
    async getCategorias(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM categorias_tarefas WHERE id_usuario = ? AND ativo = TRUE ORDER BY nome',
                [userId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Criar nova tarefa
    async create(tarefaData) {
        try {
            const {
                id_usuario,
                id_categoria,
                titulo,
                descricao,
                data_inicio,
                data_termino
            } = tarefaData;

            const [result] = await pool.execute(
                `INSERT INTO tarefas (
                    id_usuario, id_categoria, titulo, descricao,data_inicio, data_termino
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    id_usuario, id_categoria, titulo, descricao, data_inicio, data_termino
                ]
            );

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Buscar todas as tarefas
    static async getAll(userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT t.*, c.nome as categoria_nome 
                 FROM tarefas t 
                 LEFT JOIN categorias_tarefas c ON t.id_categoria = c.id 
                 WHERE t.id_usuario = ?`,
                [userId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new agendaModel();