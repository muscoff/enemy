const express = require('express');
const db = require('../dbconnect');
const appurl = require('../weblink');
const formidable = require('formidable');
const Joi = require('joi');
const path = require('path');
const fs = require('fs');
const port = process.env.PORT || 4000;
const weblink = `${appurl}:${port}`;

const app = express();

app.get('/', (req, res)=>{
    let sql = "SELECT * FROM `products`";

    db.query(sql, (err, result)=>{
        if(err){
            res.send({status: false, msg: err.sqlMessage});
            res.end();
        }else{
            result.map(item=>{
                item.img = JSON.parse(item.img);
            });
            res.send(result);
            res.end();
        }
    });
});

app.post('/', (req, res)=>{
    let sql = "INSERT INTO `products` SET ?";
    const form = formidable({multiples: true});

    const dirName = path.parse(__dirname);
    const maxSize = 2097152;

    form.parse(req, (err, fields, files)=>{
        if(err){
            res.send({status: false, msg: 'Error occurred'});
        }else{
            const {error, value} = validateProductInput(fields);

            if(error){
                res.send({status: false, msg: error.details[0].message});
                res.end();
            }else{
                if(files.img){
                    if(files.img.length <= 4){
                        let dbList = [];
                        let serverList = [];
                        files.img.forEach(item=>{
                            // if(item.size <= maxSize){
                                let rand = Math.floor(Math.random() * 1000000000) + 1;
                                let oldPath = item.path;
                                let filename = rand.toString() + item.name;
                                let newPath = path.join(dirName.dir, 'images', 'products', filename);
                                let dbName = weblink + '/images/products/' + filename;

                                if(!fs.existsSync(newPath)){
                                    serverList.push({oldPath, newPath});
                                    dbList.push(dbName);
                                    fs.renameSync(oldPath, newPath);
                                }
                            // }
                        });
                        
                        let db_name = {images: dbList};
                        db_name = JSON.stringify(db_name);
                        value.img = db_name;

                        db.query(sql, value, (err, result)=>{
                            if(err){
                                res.send({status: false, msg: err.sqlMessage});
                                res.end();
                            }else{
                                res.send({status: true, msg: 'Input recorded'});
                                res.end();
                            }
                        });
                    }else{
                        res.send({status: false, msg: 'Maximum file upload is 4!'});
                        res.end();
                    }
                }else{
                    res.send({status: false, msg: 'A product image is expected at least. Upload a product image'});
                    res.end();
                }
            }
        }
    });
});

validateProductInput = input => {
    let schema = Joi.object({
        category: Joi.string().min(3).required(),
        title: Joi.string().min(3).required(),
        price: Joi.number().min(1).required(),
        description: Joi.string().min(3).required()
    });

    return schema.validate(input);
}

module.exports = app;