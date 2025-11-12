const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../model/userModel');
const chatModel = require('../model/chatModel');
const questionModel = require('../model/questionarioModel');

const JWT_SECRET = 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.cookies?.token ||
        req.headers['authorization']?.split(' ')[1];
    console.log(token);

    if (!token) {
        return res.redirect('/');
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({error: 'Invalid token'});
        }
        req.user = user;
        next();
    });
};

// Middleware para verificar roles/permissões
const requireRole = (role) => {
    return (req, res, next) => {
        if (req.session && req.session.user && req.session.user.role === role) {
            return next();
        } else {
            res.status(403).send('Acesso negado');
        }
    };
};

router.get('/', function (req, res) {
    res.render('index', {title: 'Fucapi Acolhe', message: ''});
});

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).json({error: 'Username and password required'});
        }
        const user = await userModel.findUserByEmail(email);
        console.log(user);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({error: 'Invalid credentials'});
        }

        const token = jwt.sign({id: user.id, username: user.username, papel: user.papel}, JWT_SECRET, {
            expiresIn: '24h'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });

        const question = await questionModel.isAnswered(user.id);
        if (!question) {
            res.json({message: "Login realizado com sucesso",question:true});
        }else{
            res.json({message: "Login realizado com sucesso",question:false});

        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.get('/dashboard', authenticateToken, function (req, res) {
    switch (req.user.papel) {
        case 'admin':
            res.render('dashboard', {user: req.user});
        case 'professor':
            res.render('dashboard', {user:  req.user});
        case 'secretaria':
            res.render('dashboard', {user:  req.user});
        default:
            res.render('home', {title: req.user});

    }

});

router.post('/register', async function (req, res) {
    try {
        const {username, email, password, papel} = req.body;
        console.log(req.body);

        if (!email || !password) {
            return res.status(400).json({error: 'All fields are required'});
        }

        const existingUser = await userModel.findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({error: 'Username already exists'});
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const userId = await userModel.createUser(username, email, hashedPassword, papel);

        res.json({user: {id: userId, username, email}});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.post('/logout', function (req, res) {
    res.clearCookie("token");
    res.json({message: "Logout realizado com sucesso"});
});

router.get('/conecta', function (req, res) {
    res.render('conecta', {title: 'FUCAPI Acolhe - Dashboard', message: ''});
})

router.get('/chat/users', async function (req, res) {
    try {
        const users = await userModel.findUserByType(1);
        console.log(users);
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.get('/dashboard/chat', authenticateToken, function (req, res) {
    console.log(req.user);
    if (req.user.papel !== 'aluno') {
        res.render('admin', {title: 'FUCAPI Acolhe - Dashboard', message: '',user: req.user});
    }
    res.render('temp', {title: 'FUCAPI Acolhe - Dashboard', message: '',user: req.user});
});


router.get('/error', function (req, res) {
    res.render('error');
})

/*router.get('/dashboard',authenticateToken, function (req, res) {
    res.render('dashboard', {user: req.user});
})*/

router.get('/admin', authenticateToken, function (req, res) {
    res.render('admin', {title: 'FUCAPI Acolhe - Dashboard', message: ''});
});

router.get('/users/searchfixed', authenticateToken, async function (req, res) {
    try {
        const users = await userModel.findFixedUsers('pedagogia', 'secretaria', 'professor');
        res.json(users);

    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

// Rota POST para criar nova conversa
router.post('/conversations', authenticateToken, async (req, res) => {
    try {
        const {otherUserId} = req.body;

        if (!otherUserId) {
            return res.status(400).json({error: 'otherUserId é obrigatório'});
        }

        // Verifica se o outro usuário existe
        const otherUser = await userModel.findUserById(otherUserId);
        if (!otherUser) {
            return res.status(404).json({error: 'Usuário não encontrado'});
        }

        // Verifica se não está tentando criar conversa consigo mesmo
        if (parseInt(otherUserId) === req.user.id) {
            return res.status(400).json({error: 'Não é possível criar conversa consigo mesmo'});
        }

        // Cria ou obtém a conversa existente
        const conversationId = await chatModel.createConversation(req.user.id, otherUserId);

        if (!conversationId) {
            return res.status(500).json({error: 'Erro ao criar conversa'});
        }

        // Obtém os dados completos da conversa
        //const conversation = await chatModel.getConversation(req.user.id, otherUserId);
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
        res.status(500).json({error: 'Erro interno do servidor'});
    }
});

router.get('/users/:userId', authenticateToken, async (req, res) => {
    try {
        const {userId} = req.params;
        const user = await userModel.findUserById(userId);

        if (!user) {
            return res.status(404).json({error: 'Usuário não encontrado'});
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({error: 'Erro interno do servidor'});
    }
});

router.get('/current', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findUserById(userId);

        if (!user) {
            return res.status(404).json({error: 'Usuário não encontrado'});
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({error: 'Erro interno do servidor'});
    }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
    try {
        const {conversationId} = req.params;
        console.log("conversationId: " + conversationId);
        const messages = await chatModel.getMessages(conversationId);

        res.json(messages);
    } catch (error) {
        console.log(error);
        //console.log(conversationId);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.get('/conversations', authenticateToken, async (req, res) => {
    try {
        const conversations = await chatModel.getUserConversations(req.user.id);
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/dashboard/foco',authenticateToken,(req,res)=>{
    res.render('pomodoro',{user: req.user});
});

router.get('/dashboard/diario-emocoes',authenticateToken,(req,res)=>{
    res.render('diario-emocoes',{user: req.user});
});

router.get('/dashboard/respiracao-guiada',authenticateToken,(req,res)=>{
    res.render('respiracao-guiada',{user: req.user});
});

router.get('/dashboard/sons-relaxantes',authenticateToken,(req,res)=>{
    res.render('sons-relaxantes',{user: req.user});
});

router.get('/dashboard/perfil-necessidades',authenticateToken,(req,res)=>{
    res.render('perfil-necessidades',{user: req.user});
});


module.exports = router;
