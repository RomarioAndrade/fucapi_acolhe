const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: 3306,
    database: 'fucapi_acolhe',
    multipleStatements: true
});

connection.connect(function(err) {
    if (err) {
        throw err;
    }
})

global.db = connection;
module.exports = db;