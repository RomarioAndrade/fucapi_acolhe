const {createConnection} = require('../database/db');

class agendaModel {

    //Buscar todas as tarefas em uma data especifica
    async findTarefasByData(userId, data) {
        const connection = await createConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM tarefas WHERE data_inicio LIKE ? AND id_usuario = ?',
            [`${data}%`, userId]
        );
        await connection.end();
        return rows[0];
    }

    // Buscar todas as categorias
    async getCategorias(userId) {
        const connection = await createConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM categorias_tarefas WHERE id_usuario = ? AND ativo = TRUE ORDER BY nome',
                [userId]
            );
            return rows;
        } finally {
            await connection.end();
        }
    }

    async createCategoria(categoria) {
        const connection = await createConnection();
        try {
            const {id_usuario, nome} = categoria;

            const [result] = await connection.execute(`
                INSERT INTO categorias_tarefas(id_usuario, nome)
                VALUES (?, ?);
            `, [id_usuario, nome]);

            const categorioId = await connection.execute(`
                SELECT id
                from categorias_tarefas
                WHERE id_usuario = ?
                  AND nome = ?;
            `, [id_usuario, nome]);

            return result[0]?.id || null;
        } finally {
            await connection.end();
        }
    }

    async findCategoriaByName(userId, categoriaName) {
        const connection = await createConnection();
        try {
            const [rows] = await connection.execute(`
                SELECT id
                FROM categorias_tarefas
                WHERE id_usuario = ?
                  AND nome = ?
            `, [userId, categoriaName]);

            return rows[0];
        } finally {
            await connection.end();
        }
    }

    // Criar nova tarefa
    async createTarefa(tarefaData) {
        const connection = await createConnection();
        try {
            const {
                id_usuario,
                id_categoria,
                titulo,
                descricao,
                data_inicio
            } = tarefaData;

            const [result] = await connection.execute(
                `INSERT INTO tarefas (id_usuario, id_categoria, titulo, descricao, data_inicio)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    id_usuario, id_categoria, titulo, descricao, data_inicio
                ]
            );
            return result.insertId;
        } finally {
            await connection.end();
        }
    }

    // Buscar todas as tarefas
    async getAll(userId) {
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