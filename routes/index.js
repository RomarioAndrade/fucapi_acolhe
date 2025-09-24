var express = require('express');
var router = express.Router();

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
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.post('/login', function (req, res) {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Erro na consulta de login:', err);
            return res.status(500).send('Erro no servidor.');
        }
        if (results.length === 0) {
            return res.status(401).send('Email ou senha incorretos.');
        }
        const user = results[0];

        // Comparar a senha fornecida com o hash armazenado
        hasher({ password, salt: user.salt }, (err, pass, salt, hash) => {
            if (err) {
                return res.status(500).send('Erro ao verificar a senha.');
            }

            if (hash === user.hash) {
                // Senha correta, crie a sessão
                req.session.userId = user.id;
                req.session.username = user.username;
                //res.render('home', {title: user.username});
                res.redirect('home');
            } else {
                res.status(401).send('Email ou senha incorretos.');
            }
        });
    });
});

 router.get('/home',ensureAuthenticated,function (req, res) {
    res.render('home', {title: req.session.username});
});

router.post('/register', function (req, res) {
    const { username, email, password } = req.body;
    // Hash da senha com salt
    hasher({ password }, (err, pass, salt, hash) => {
        if (err) {
            return res.status(500).send('Erro ao hashear a senha.');
        }
        const query = 'INSERT INTO users (username, email, hash, salt) VALUES (?, ?, ?, ?)';
        db.query(query, [username, email, hash, salt], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).send('Usuário ou email já cadastrado.');
                }
                console.error('Erro ao inserir usuário:', err);
                return res.status(500).send('Erro no servidor.');
            }
            res.status(201).send('Usuário registrado com sucesso!');
        });
    });
});

router.get('/logout', function (req, res) {
    req.session.destroy(function(){
        res.redirect('/');
    });
})

module.exports = router;
