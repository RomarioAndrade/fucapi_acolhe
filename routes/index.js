const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../model/userModel');

const JWT_SECRET = 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.cookies?.token ||
        req.headers['authorization']?.split(' ')[1];
    console.log(token);

    if (!token) {
        return res.status(401).json({error: 'Access token required'});
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({error: 'Invalid token'});
        }
        req.user = user;
        next();
    });
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

        const token = jwt.sign({id: user.id, username: user.username}, JWT_SECRET, {
            expiresIn: '24h'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });

        res.json({ message: "Login realizado com sucesso" });

    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

router.get('/home', authenticateToken, function (req, res) {
    res.render('home', {title: req.cookies['username']});
});

router.post('/register', async function (req, res) {
    try {
        const {username, email, password, type} = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({error: 'All fields are required'});
        }

        const existingUser = await userModel.findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({error: 'Username already exists'});
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const userId = await userModel.createUser(username, email, hashedPassword, type);

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

router.get('/temp', function (req, res) {
    res.render('temp', {title: 'FUCAPI Acolhe - Dashboard', message: ''});
});


router.get('/error', function (req, res) {
    res.render('error');
})

module.exports = router;
