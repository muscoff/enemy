const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'enemy'
});

db.connect(err=>{
    if(err){
        console.log('Failed to connect to database');
    }else{
        console.log('Database connected');
    }
});

module.exports = db;