const { createConnection } = require('../database/db');

class UserModel {

    async createUser(username, email, password) {
        const connection = await createConnection();
        const [result] = await connection.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
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
            'SELECT u.*,ut.type FROM users u LEFT JOIN user_type ut ON u.id = ut.user WHERE u.email = ?',
            [email]
        );
        /*const [rows] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );*/
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
}
module.exports = new UserModel();
