const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'fucapi_acolhe'
};


const createConnection = async () => {
    return await mysql.createConnection(dbConfig);
};

const initializeDatabase = async () => {
    try {
        const connection = await createConnection();

        // Create users table
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            hash VARCHAR(255) NOT NULL,
            salt VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await connection.execute(`
          CREATE TABLE IF NOT EXISTS users_type (
            id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
            user_id INT UNIQUE NOT NULL,
            user_type VARCHAR(255) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
          )
        `);

        // Create conversations table
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS conversations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user1_id INT NOT NULL,
            user2_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user1_id) REFERENCES users(id),
            FOREIGN KEY (user2_id) REFERENCES users(id),
            UNIQUE KEY unique_conversation (user1_id, user2_id)
          )
        `);

        // Create messages table
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            conversation_id INT NOT NULL,
            sender_id INT NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id),
            FOREIGN KEY (sender_id) REFERENCES users(id)
          )
        `);

        // Adicione após a criação da tabela messages
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            message_id INT,
            conversation_id INT NOT NULL,
            sender_id INT NOT NULL,
            original_name VARCHAR(255) NOT NULL,
            stored_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(500) NOT NULL,
            file_size BIGINT NOT NULL,
            mime_type VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id),
            FOREIGN KEY (sender_id) REFERENCES users(id)
          )
        `);

        console.log('Database initialized successfully');
        await connection.end();
    } catch (error) {
        console.error('Database initialization failed:', error);
    }
};

module.exports = {createConnection};