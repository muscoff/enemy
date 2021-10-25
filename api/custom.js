const express = require('express');
const db = require('../dbconnect');
const appurl = require('../weblink');
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const Joi = require('joi');

const port = process.env.PORT || 4000;
const weblink = `${appurl}:${port}`;

const app = express();

app.get('/', (req, res)=>{
    let sql = "SELECT * FROM `custom`";

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
    let sql = "INSERT INTO `custom` SET ?";
    const form = formidable({multiple: true});
    const dirName = path.parse(__dirname);
    const maxSize = 2097152;

    form.parse(req, (err, fields, files)=>{
        if(err){
            res.send({status: false, msg: 'Error occurred'});
        }else{
            if(files.img){
                let rand = Math.floor(Math.random() * 1000000000);
                let oldPath = files.img.path;
                let filename = rand.toString() + files.img.name;
                let filesize = files.img.size;
                let dbName = weblink + '/images/general/' + filename;
                let newPath = path.join(dirName.dir, 'images', 'general', filename);
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
                                    const {error, value} = validateCustomInput(fields);
                                    if(error){
                                        fs.unlinkSync(newPath);
                                        res.send({status: false, msg: error.details[0].message});
                                        res.end();
                                    }else{
                                        value.img = dbName;
                                        db.query(sql, value, (err, result)=>{
                                            if(err){
                                                fs.unlinkSync(newPath);
                                                res.send({status: false, msg: err.sqlMessage});
                                                res.end();
                                            }else{
                                                res.send({status: true, msg: 'Input recorded'});
                                                res.end();
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });
                // }else{
                //     res.send({status: false, msg:'File size must be 2MB or less'});
                //     res.end();
                // }
            }else{
                res.send({status: false, msg: 'File upload is required'});
                res.end();
            }
        }
    });
});

app.put('/', (req, res)=>{
    const form = formidable({multiples: false});
    let sql = "UPDATE `custom` SET `subtitle`=?, `title`=?, `content`=?, `buttonName`=?, `link`=?, `img`=? WHERE `id`=?";
    let dirName = path.parse(__dirname);
    const maxSize = 2097152;

    form.parse(req, (err, fields, files)=>{
        if(err){
            res.send({status: false, msg: 'Error occurred'});
            res.end();
        }else{
            let id = fields.id; let oldImage = fields.oldImage;
            let field = {
                subtitle: fields.subtitle, 
                title: fields.title, 
                content: fields.content, 
                buttonName: fields.buttonName, 
                link: fields.link
            };
            const {error, value} = validateCustomInput(field);
            let valueArr = [value.subtitle, value.title, value.content, value.buttonName, value.link];
            
            if(error){
                res.send({status: false, msg: error.details[0].message});
                res.end();
            }else{
                if(files.img){
                    let rand = Math.floor(Math.random() * 1000000000);
                    let oldPath = files.img.path;
                    let filesize = files.img.size;
                    let filename = rand.toString() + files.img.name;
                    let dbName = weblink + '/images/general/' + filename;
                    let newPath = path.join(dirName.dir, 'images', 'general', filename);

                    valueArr = [...valueArr, dbName, id];

                    let splitImage = oldImage.split('/');
                    splitImage = splitImage[splitImage.length - 1];
                    let oldImagePath = path.join(dirName.dir, 'images', 'general', splitImage);

                    // if(filesize <= maxSize){
                        fs.exists(newPath, exists=>{
                            if(exists){
                                res.send({status: false, msg: 'Filename already exist. Try again'});
                                res.end();
                            }else{
                                fs.rename(oldPath, newPath, (err)=>{
                                    if(err){
                                        res.send({status: false, msg: 'Filename already exist. Try again'});
                                        res.end();
                                    }else{
                                        db.query(sql, valueArr, (err, result)=>{
                                            if(err){
                                                fs.unlinkSync(newPath);
                                                res.send({status: false, msg: err.sqlMessage});
                                                res.end();
                                            }else{
                                                fs.unlinkSync(oldImagePath);
                                                if(result.affectedRows){
                                                    res.send({status: true, msg: 'Record updated'});
                                                    res.end();
                                                }else{
                                                    res.send({status: false, msg: 'Failed to update record'});
                                                    res.end();
                                                }
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
                    //valueArr = [...valueArr, oldImage, id];
                    valueArr = [...valueArr, oldImage, 100];

                    db.query(sql, valueArr, (err, result)=>{
                        if(err){
                            res.send({status: false, msg: err.sqlMessage});
                            res.end();
                        }else{
                            if(result.affectedRows){
                                res.send({status: true, msg: 'Record updated'});
                                res.end();
                            }else{
                                res.send({status: false, msg:'Failed to update record'});
                                res.end();
                            }
                        }
                    });
                }
            }
        }
    });
});

validateCustomInput = input => {
    let schema = Joi.object({
        subtitle: Joi.string().min(3).required(),
        title: Joi.string().min(3).required(),
        content: Joi.string().min(3).required(),
        buttonName: Joi.string().min(3).required(),
        link: Joi.string().required()
    });

    return schema.validate(input);
}

module.exports = app;