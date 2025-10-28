const pool = require('../config/database');

class Tarefa {
    // Buscar todas as categorias
    static async getCategorias(userId) {
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
    static async create(tarefaData) {
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

module.exports = Tarefa;