const express = require('express');
const db = require('../dbconnect');
const path = require('path');
const fs = require('fs');
const appurl = require('../weblink');
const formidable = require('formidable');
const Joi = require('joi');

const app = express();
const port = process.env.PORT || 4000;
const weblink = `${appurl}:${port}`;

app.get('/', (req, res)=>{
    let sql = "SELECT * FROM `carry`";

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

app.post('/', (req, res)=>{
    let sql = "INSERT INTO `carry` SET ?";
    const maxSize = 2097152;
    const form = formidable({multiple: true});

    const dirName = path.parse(__dirname);

    form.parse(req, (err, fields, files)=>{
        if(files.img){
            let rand = Math.floor(Math.random() * 1000000000);
            const filesize = files.img.size;
            const oldPath = files.img.path;
            let filename = rand.toString() + files.img.name;
            let destination = path.join(dirName.dir, 'images', 'general', filename);
            const dbName = weblink + '/images/general/' + filename;

            let {error, value} = validateCarryInput(fields);

            if(error){
                res.send({status: false, msg: error.details[0].message});
                res.end();
            }else{
                // if(filesize <= maxSize){
                    fs.exists(destination, exists=>{
                        if(exists){
                            res.send({status: false, msg: 'Filename already exist. Try again'});
                            res.end();
                        }else{
                            fs.rename(oldPath, destination, (err)=>{
                                if(err){
                                    res.send({status: false, msg: err.message});
                                    res.end();
                                }else{
                                    value.img = dbName;
                                    db.query(sql, value, (err, result)=>{
                                        if(err){
                                            fs.unlinkSync(destination);
                                            res.send({status: false, msg: err.sqlMessage});
                                            res.end();
                                        }else{
                                            res.send({status: true, msg: 'Input recorded'});
                                            res.end();
                                        }
                                    });
                                }
                            });
                        }
                    });
                // }else{
                //     res.send({status: false, msg: 'File size must be 2MB or less'});
                //     res.end();
                // }
            }
        }else{
            res.send({status: false, msg: 'File upload is required to process'});
            res.end();
        }
    });
});

app.put('/', (req, res)=>{
    const form = formidable({multiples: false});
    let dirName = path.parse(__dirname);
    const maxSize = 2097152;

    form.parse(req, (err, fields, files)=>{
        if(err){
            res.send({status: false, msg: 'Error occurred'});
            res.end();
        }else{
            let field = {
                title: fields.title, 
                content: fields.content,
                buttonName: fields.buttonName,
                link: fields.link
            };
            let id = fields.id; let oldImage = fields.oldImage;
            const {error, value} = validateCarryInput(field);

            if(error){
                res.send({status: false, msg: error.details[0].message});
                res.end();
            }else{
                let sql = "UPDATE `carry` SET `title`=?, `content`=?, `buttonName`=?, `link`=?, `img`=? WHERE `id`=?";
                let valueArr = [value.title, value.content, value.buttonName, value.link];
                
                if(files.img){
                    let rand = Math.floor(Math.random() * 1000000000);
                    let oldPath = files.img.path;
                    let filename = rand.toString() + files.img.name;
                    let filesize = files.img.size;
                    let newPath = path.join(dirName.dir, 'images', 'general', filename);
                    let dbName = weblink + '/images/general/' + filename;

                    valueArr = [...valueArr, dbName, id];

                    let splitImage = oldImage.split('/');
                    splitImage = splitImage[splitImage.length -1];

                    let oldImagePath = path.join(dirName.dir, 'images', 'general', splitImage);

                    // if(filesize <= maxSize){
                        fs.exists(newPath, exists=>{
                            if(exists){
                                res.send({status: false, msg: 'Filename already exist. Try again'});
                                res.end();
                            }else{
                                fs.rename(oldPath, newPath, (err)=>{
                                    if(err){
                                        res.send({status: false, msg: 'Failed to upload file'});
                                        res.end();
                                    }else{
                                        db.query(sql, valueArr, (err, result)=>{
                                            if(err){
                                                fs.unlinkSync(newPath);
                                                res.send({status: false, msg: err.sqlMessage});
                                                res.end();
                                            }else{
                                                fs.unlinkSync(oldImagePath);
                                                res.send({status: true, msg: 'Record updated'});
                                                res.end();
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    // }else{
                    //     res.send({status: false, msg:'File size must be 2MB or less'});
                    //     res.end();
                    // }
                }else{
                    valueArr = [...valueArr, oldImage, id];
                    db.query(sql, valueArr, (err, result)=>{
                        if(err){
                            res.send({status: false, msg: err.sqlMessage});
                            res.end();
                        }else{
                            res.send({status: true, msg: 'Record Updated'});
                            res.end();
                        }
                    });
                }
            }
        }
    });
});

validateCarryInput = input => {
    let schema = Joi.object({
        title: Joi.string().min(3).required(),
        content: Joi.string().min(3).required(),
        buttonName: Joi.string().min(3).required(),
        link: Joi.string().required()
    });

    return schema.validate(input);
}

module.exports = app;