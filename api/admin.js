const express = require('express');
const formidable = require('formidable');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const db = require('../dbconnect');

const app = express();

app.get('/', (req, res)=>{
    let sql = "SELECT * FROM `admin_table`";

    db.query(sql, (err, result)=>{
        if(err){
            res.send({status: false});
            res.end();
        }else{
            let obj = {};
            obj.status = result.length > 0 ? true : false;
            res.send(obj);
            res.end();
        }
    });
});

app.post('/create', (req, res)=>{
    let sql = "INSERT INTO `admin_table` SET ?";
    const form = formidable({multiple: true});

    form.parse(req, (err, fields, files)=>{
        const { value, error} = validateInput(fields);
        if(error){
            res.send({status: false, msg: error.details[0].message});
            res.end();
        }else{
            value.password = bcrypt.hashSync(value.password, 10);
            db.query(sql, value, (err, result, field)=>{
                if(err){
                    if(err.code === 'ER_DUP_ENTRY'){
                        res.send({status: false, msg: 'Username already exist'});
                        res.end();
                    }else{
                        res.send({status: false, msg: err.sqlMessage});
                        res.end();
                    }
                }else{
                    res.send({status: true, msg: 'Account created'});
                    res.end();
                }
            });
        }
    });
});

app.post('/login', (req, res)=>{
    let sql = "SELECT * FROM `admin_table` WHERE `username`=?";

    const form = formidable({ multiple: true});

    form.parse(req, (err, fields, files)=>{
        const {value, error} = validateInput(fields);

        if(error){
            res.send({status: false, msg: error.details[0].message});
            res.end();
        }else{
            db.query(sql,[value.username] , (err, result, field)=>{
                if(err){
                    res.send({status: false, msg: 'Database error...'});
                    res.end();
                }else{
                    if(result.length > 0){
                        result = result[0];
                        const compare = bcrypt.compareSync(value.password, result.password);
                        if(compare){
                            res.send({status: true, msg: 'Account verified'});
                            res.end();
                        }else{
                            res.send({status: false, msg: 'Invalid username or password'});
                            res.end();
                        }
                    }else{
                        res.send({status: false, msg: 'Invalid username'});
                        res.end();
                    }
                }
            });
        }
    });
});

validateInput = input => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().alphanum().min(4).max(30).required()
    });

    return schema.validate(input);
}

module.exports = app;