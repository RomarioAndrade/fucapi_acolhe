var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const userModel = require('../model/userModel');
const db = require('../database/db');

// Middleware de proteção de rotas
const ensureAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).send('Acesso não autorizado. Faça login.');
    }
};

/* GET home page. */
router.get('/login', function (req, res, next) {
    res.render('index', {title: 'Fucapi Acolhe', message: ''});
});

router.get('/',function (req, res, next) {
    res.redirect('/login')
});

router.post('/login', async  (req, res) =>{
    try{
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        const user = await userModel.findUserByEmail(email);
        console.log(user);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user.id;
        req.session.username = user.username;
        res.redirect('/home');

    }catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/home', ensureAuthenticated, function (req, res) {
    res.render('home', {title: req.session.username});
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

        res.json({ user: { id: userId, username, email } });
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.get('/logout', function (req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
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


module.exports = router;
