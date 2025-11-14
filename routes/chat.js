const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const chatModel = require('../model/chatModel');
const userModel = require('../model/userModel');
const router = express.Router();

const JWT_SECRET = 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await userModel.findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await chatModel.createUser(username, email, hashedPassword);

        const token = jwt.sign({ id: userId, username }, JWT_SECRET);
        res.json({ token, user: { id: userId, username, email } });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const user = await user.findUserByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user conversations
router.get('/conversations', authenticateToken, async (req, res) => {
    try {
        const conversations = await chatModel.getUserConversations(req.user.id);
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
    try {
        const {conversationId}  = req.params;
        console.log("conversationId: "+conversationId);
        const messages = await chatModel.getMessages(conversationId);

        res.json(messages);
    } catch (error) {
        console.log(error);
        //console.log(conversationId);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Rota POST para criar nova conversa
router.post('/conversations', authenticateToken, async (req, res) => {
    try {
        const { otherUserId } = req.body;

        if (!otherUserId) {
            return res.status(400).json({ error: 'otherUserId é obrigatório' });
        }

        // Verifica se o outro usuário existe
        const otherUser = await chatModel.findUserById(otherUserId);
        if (!otherUser) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Verifica se não está tentando criar conversa consigo mesmo
        if (parseInt(otherUserId) === req.user.id) {
            return res.status(400).json({ error: 'Não é possível criar conversa consigo mesmo' });
        }

        // Cria ou obtém a conversa existente
        const conversationId = await chatModel.createConversation(req.user.id, otherUserId);

        if (!conversationId) {
            return res.status(500).json({ error: 'Erro ao criar conversa' });
        }

        // Obtém os dados completos da conversa
        const conversation = await chatModel.getConversation(req.user.id, otherUserId);
        const conversations = await chatModel.getUserConversations(req.user.id);
        const newConversation = conversations.find(c => c.id === conversationId);

        res.status(201).json({
            id: conversationId,
            other_user: otherUser.username,
            other_user_id: otherUser.id,
            last_message: null,
            last_message_time: null,
            ...newConversation
        });

    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Search users
router.get('/users/search', authenticateToken, async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.json([]);
        }

        const connection = await require('../database/db').createConnection();
        const [rows] = await connection.execute(
            'SELECT id, username, email FROM users WHERE username LIKE ? AND id != ?',
            [`%${query}%`, req.user.id]
        );
        await connection.end();

        res.json(rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/users/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await chatModel.findUserById(userId);

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;