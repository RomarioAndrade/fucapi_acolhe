const {createConnection} = require('../database/db');

class UserModel {

    async createUser(username, email, password, papel) {
        const connection = await createConnection();
        const [result] = await connection.execute(
            'INSERT INTO users (username, email, password, id_role) VALUES (?, ?, ?, ?)',
            [username, email, password, papel]
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
            //'SELECT * FROM users WHERE email = ?',
            'SELECT u.id,u.username,u.email,u.password,tu.papel FROM users u INNER JOIN user_role tu ON u.id_role = tu.id WHERE u.email = ?;',
            [email]
        );
        await connection.end();
        return rows[0];
    }

    async findUserById(id) {
        const connection = await createConnection();
        const [rows] = await connection.execute(
            'SELECT u.id,u.username,u.email,u.password,tu.papel FROM users u INNER JOIN user_role tu ON u.id_role = tu.id WHERE u.id = ?;',
            [id]
        );
        await connection.end();
        return rows[0];
    }

    async findUserByType(id) {
        const connection = await createConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE id_role = ?',
            [id]
        );
        await connection.end();
        return rows;
    }

    async findFixedUsers(admin, professor, secretaria) {
        const connection = await createConnection();
        const [rows] = await connection.execute(
            'SELECT u.id,u.username,u.email,tu.descricao as user_type,tu.papel FROM users u INNER JOIN user_role tu ON u.id_role = tu.id WHERE tu.papel = ? or tu.papel = ? or tu.papel = ?;',
            [admin, professor, secretaria]
        );
        await connection.end();
        return rows;
    }
}

module.exports = new UserModel();
