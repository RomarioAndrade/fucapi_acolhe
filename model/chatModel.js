const { createConnection } = require('../config/database');

class ChatModel {
    // Conversation methods
    async createConversation(user1Id, user2Id) {
        const connection = await createConnection();

        try {
            // Ensure user1Id is always smaller than user2Id to avoid duplicate conversations
            const [minId, maxId] = [Math.min(user1Id, user2Id), Math.max(user1Id, user2Id)];

            // Tenta criar a conversa (ignora se já existir devido ao ON DUPLICATE KEY)
            const [result] = await connection.execute(
                'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=id',
                [minId, maxId]
            );

            // Get the conversation ID (seja novo ou existente)
            const [conversation] = await connection.execute(
                'SELECT id FROM conversations WHERE user1_id = ? AND user2_id = ?',
                [minId, maxId]
            );

            return conversation[0]?.id || null;
        } finally {
            await connection.end();
        }
    }

    async getConversation(user1Id, user2Id) {
        const connection = await createConnection();
        const [minId, maxId] = [Math.min(user1Id, user2Id), Math.max(user1Id, user2Id)];

        const [rows] = await connection.execute(
            'SELECT * FROM conversations WHERE user1_id = ? AND user2_id = ?',
            [minId, maxId]
        );
        await connection.end();
        return rows[0];
    }

    async getUserConversations(userId) {
        const connection = await createConnection();
        const [rows] = await connection.execute(`
      SELECT c.id, 
             CASE 
               WHEN c.user1_id = ? THEN u2.username 
               ELSE u1.username 
             END as other_user,
             CASE 
               WHEN c.user1_id = ? THEN u2.id 
               ELSE u1.id 
             END as other_user_id,
             (SELECT message FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
             (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
      FROM conversations c
      LEFT JOIN users u1 ON c.user1_id = u1.id
      LEFT JOIN users u2 ON c.user2_id = u2.id
      WHERE c.user1_id = ? OR c.user2_id = ?
      ORDER BY last_message_time DESC
    `, [userId, userId, userId, userId]);

        await connection.end();
        return rows;
    }

// Message methods
    async createMessage(conversationId, senderId, message) {
        const connection = await createConnection();
        const [result] = await connection.execute(
            'INSERT INTO messages (conversation_id, sender_id, message) VALUES (?, ?, ?)',
            [conversationId, senderId, message]
        );
        await connection.end();
        return result.insertId;
    }

    async getMessages(conversationId, limit = 50) {
        console.log("chatModel: "+conversationId);
        console.log("chatModel: "+limit);
        const connection = await createConnection();
        const [rows] = await connection.execute(`SELECT m.*, u.username as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.conversation_id = ? ORDER BY m.created_at ASC LIMIT 50`, [conversationId]);

        await connection.end();
        return rows;
    }

    async markMessagesAsRead(conversationId, userId) {
        const connection = await createConnection();
        await connection.execute(
            'UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE',
            [conversationId, userId]
        );
        await connection.end();
    }
}