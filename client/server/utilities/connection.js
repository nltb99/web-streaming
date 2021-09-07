const mysql = require('mysql');

// * Local
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: '12345678',
    database: 'web_streaming'
});

// * Hosting
// const connection = mysql.createConnection({
//     host: 'qao3ibsa7hhgecbv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
//     user: 'nvul8spvugvkubpy',
//     password: 'yk0t213v0ezl9uuw',
//     database: 'cs6p0fk9qxqswmjb'
// });

connection.connect();

const executeQuery = (sql) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, function (error, results) {
            if (error) reject(error.sqlMessage)
            resolve(results)
        });
    })
}
const payload = (status = 200, msg = '', data = []) => {
    return { status, msg, data }
}

module.exports = { executeQuery, payload };