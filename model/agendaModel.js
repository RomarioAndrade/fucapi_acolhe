const {createConnection} = require('../database/db');

class agendaModel {

    //Buscar todas as tarefas em uma data especifica
    async findTarefasByData(userId, data) {
        const connection = await createConnection();
        const [rows] = await connection.execute('SELECT u.id,u.id_usuario,u.titulo,u.descricao,u.data_inicio,ct.nome as categoria FROM tarefas u inner join categorias_tarefas ct on id_categoria = ct.id WHERE u.data_inicio LIKE ? AND u.id_usuario = ?', [`${data}%`, userId]);
        await connection.end();
        return rows;
    }

    // Buscar todas as categorias
    async getCategorias(userId) {
        const connection = await createConnection();
        try {
            const [rows] = await connection.execute('SELECT * FROM categorias_tarefas WHERE id_usuario = ? AND ativo = TRUE ORDER BY nome', [userId]);
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

            return categorioId[0];
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
                id_usuario, id_categoria, titulo, descricao, data_inicio
            } = tarefaData;

            const [result] = await connection.execute(`INSERT INTO tarefas (id_usuario, id_categoria, titulo, descricao, data_inicio)
                                                       VALUES (?, ?, ?, ?,
                                                               ?)`, [id_usuario, id_categoria, titulo, descricao, data_inicio]);
            return result.insertId;
        } finally {
            await connection.end();
        }
    }

    // Buscar todas as tarefas
    async getAll(userId) {
        const connection = await createConnection();
        try {
            const [rows] = await connection.execute(`SELECT t.*, c.nome as categoria_nome
                                                     FROM tarefas t
                                                              LEFT JOIN categorias_tarefas c ON t.id_categoria = c.id
                                                     WHERE t.id_usuario = ?`, [userId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Buscar tarefa pelo id
    async findTarefaById(id) {
        const connection = await createConnection();
        try {
            const [rows] = await connection.execute(`select t.id,
                                                            t.id_usuario,
                                                            t.titulo,
                                                            t.descricao,
                                                            ct.nome as categoria,
                                                            t.data_inicio
                                                     from tarefas t
                                                              inner join categorias_tarefas ct on t.id_categoria = ct.id
                                                     where t.id = ?`, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Remover tarefa pelo id
    async removeTarefaById(id) {
        const connection = await createConnection();
        try {
            const [result] = await connection.execute(`delete
                                                     from tarefas
                                                     where id = ?`, [id]);
            return result.id;
        } catch (error) {
            throw error;
        }
    }

    async updateTarefa(tarefa) {
        const connection = await createConnection();
        try {
            const {
                id_usuario, id_categoria, titulo, descricao, data_inicio
            } = tarefaData;

            const [result] = await connection.execute(`UPDATE tarefas SET id_categoria = ?, titulo = ?, descricao = ?, data_inicio = ?
                                                       WHERE id_usuario = ? `, [id_categoria, titulo, descricao, data_inicio, id_usuario]);
            return result;
        } finally {
            await connection.end();
        }
    }
}

module.exports = new agendaModel();