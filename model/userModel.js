const {createConnection} = require('../database/db');

class UserModel {

    async createUser(username, email, password, user_type) {
        const connection = await createConnection();
        const [result] = await connection.execute(
            'INSERT INTO users (username, email, password, id_tipo_usuario) VALUES (?, ?, ?, ?)',
            [username, email, password, user_type]
        );
        await connection.end();
        return result.insertId;
    }

    async findUserByUsername(username) {
        const connection = await createConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        await connection.end();
        return rows[0];
    }

    async findUserByEmail(email) {
        const connection = await createConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        await connection.end();
        return rows[0];
    }

    async findUserById(id) {
        const connection = await createConnection();
        const [rows] = await connection.execute(
            'SELECT id, username, email, created_at FROM users WHERE id = ?',
            [id]
        );
        await connection.end();
        return rows[0];
    }

    async findUserByType(id) {
        const connection = await createConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE id_tipo_usuario = ?',
            [id]
        );
        await connection.end();
        return rows;
    }

    async findFixedUsers(type1, type2, type3) {
        const connection = await createConnection();
        const [rows] = await connection.execute(
            'SELECT u.id,u.username,u.email,tu.descricao as user_type,tu.nivel_acesso FROM users u INNER JOIN user_type tu ON u.id_tipo_usuario = tu.id WHERE tu.nivel_acesso = ? or tu.nivel_acesso = ? or tu.nivel_acesso = ?;',
            [type1, type2, type3]
        );
        await connection.end();
        return rows;
    }
}

module.exports = new UserModel();
