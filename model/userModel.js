const { createConnection } = require('../database/db');

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
}

module.exports = new UserModel();
