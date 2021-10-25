const express = require('express');
const db = require('../dbconnect');

const app = express();

app.get('/', (req, res)=>{
    let sql = "SELECT * FROM `quote`";

    db.query(sql, (err, result)=>{
        if(err){
            res.send({status: false, msg: err.sqlMessage});
            res.end();
        }else{
            res.send(result);
            res.end();
        }
    });
});

app.post('/add', (req, res)=>{
    let sql = "INSERT INTO `quote` SET ?";
    console.log(req.body);

    db.query(sql, req.body, (err, result)=>{
        if(err){
            res.send({status: false, msg: err.sqlMessage});
            res.end();
        }else{
            res.send({status: true, msg: "Input recorded"});
            res.end();
        }
    });
});

app.put('/', (req, res)=>{
    const {id, quote} = req.body;
    let sql = "UPDATE `quote` SET `quote`=? WHERE `id`=?";

    db.query(sql, [quote, id], (err, result)=>{
        if(err){
            res.send({status: false, msg: err.sqlMessage});
            res.end();
        }else{
            res.send({status: true, msg: 'Updated'});
            res.end();
        }
    });
});

module.exports = app;