const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key';

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

module.exports = authenticateToken;