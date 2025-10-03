var express = require('express');
var router = express.Router();

const userModel = require('../model/userModel');
const db = require('../database/db');
const bkfd2Password = require('pbkdf2-password');
const hasher = bkfd2Password();

// Middleware de proteção de rotas
const ensureAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).send('Acesso não autorizado. Faça login.');
    }
};

/* GET home page. */
router.get('/fucapi-acolhe/login', function (req, res, next) {
    res.render('index', {title: 'Fucapi Acolhe', message: ''});
});

router.get('/',function (req, res, next) {
    res.redirect('/fucapi-acolhe/login')
});

router.post('/login', async  (req, res) =>{
    try{
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400);
        }

        const user = await userModel.findUserByEmail(email);
        console.log(user);

        hasher({password, salt: user.salt}, (err, pass, salt, hash) => {
            if (err) {
                return res.status(500).send('Erro ao verificar a senha.');
            }

            if (hash === user.hash) {
                // Senha correta, crie a sessão
                req.session.userId = user.id;
                req.session.username = user.username;
                //res.render('home', {title: user.username});
                res.redirect('/fucapi-acolhe/home');
            } else {
                res.status(401).render('index', {title: 'Express', message: 'Email ou senha incorretos.'});
            }
        });

    }catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/fucapi-acolhe/home', ensureAuthenticated, function (req, res) {
    res.render('home', {title: req.session.username});
});

router.post('/fucapi-acolhe/register', function (req, res) {
    try {

    }catch (error) {

    }
    const {username, email, password} = req.body;
    // Hash da senha com salt
    hasher({password}, (err, pass, salt, hash) => {
        if (err) {
            return res.status(500).send('Erro ao hashear a senha.');
        }


        const query = 'INSERT INTO users (username, email, hash, salt) VALUES (?, ?, ?, ?)';
        db.query(query, [username, email, hash, salt], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).send({message: 'Usuário ou email já cadastrado.'});
                }
                console.error('Erro ao inserir usuário:', err);
                return res.status(500).send('Erro no servidor.');
            }
            res.status(201).send('Usuário registrado com sucesso!');
        });
    });
});

router.get('/logout', function (req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
});

router.get('/conecta', function (req, res) {
    res.render('conecta', {title: 'FUCAPI Acolhe - Dashboard', message: ''});
})


module.exports = router;
