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

module.exports = {createConnection};