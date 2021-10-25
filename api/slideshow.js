const express = require('express');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const formidable = require('formidable');
const Joi = require('joi');
const db = require('../dbconnect');
const appurl = require('../weblink');

const port = process.env.PORT || 4000;
const weblink = `${appurl}:${port}`;

const app = express();

app.get('/', (req, res)=>{
    let sql = "SELECT * FROM `slideshow`";

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
    const form = formidable({ multiples: false});

    let destination = path.parse(__dirname); // Exact the path of the file in an object format
    // destination.dir is the actual directory for our server

    form.parse(req, (err, fields, files)=>{
        const maxSize = 2097152;
        if(err){
            res.send({status: false, msg: 'Error occurred with form submission'});
            res.end();
        }else{
            const {error, value} = validate(fields);

            if(files.img){
                let rand = Math.floor(Math.random()*1000000000);
                let size = files.img.size;
                let filePath = files.img.path;
                let imageName = files.img.name;
                let filename = rand.toString() + imageName;
                //let dbName = path.join(weblink, 'images', 'general', filename);
                let dbName = weblink+'/images/general/'+filename;

                filename = path.join(destination.dir, 'images', 'general', filename);

                // if(size <= maxSize){
                    if(error){
                        res.send({status: false, msg: error.details[0].message});
                        res.end();
                    }else{
                        let sql = "SELECT * FROM `slideshow` WHERE `img`=?";

                        db.query(sql, [dbName], (err, result)=>{
                            if(err){
                                res.send({status: false, msg: err.sqlMessage});
                                res.end();
                            }else{
                                if(result.length > 0){
                                    res.send({status: false, msg: 'Try again. Filename already exist'});
                                    res.end();
                                }else{
                                    fs.rename(filePath, filename, err=>{
                                        if(err){
                                            res.send({status: false, msg: 'Failed to upload file'});
                                            res.end();
                                        }else{
                                            sql = "INSERT INTO `slideshow` SET ?";
                                            value.img = dbName;

                                            db.query(sql, value, (err, result)=>{
                                                if(err){
                                                    fs.unlinkSync(filename);
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
                            }
                        });
                    }
                // }else{
                //     res.send({status: false, msg: 'File size must be 2MB or less'});
                //     res.end();
                // }
            }else{
                res.send({status: false, msg: 'Image file is required!'});
                res.end();
            }
        }
    });
});

validate = input => {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        link: Joi.string().required()
    });

    return schema.validate(input);
}

module.exports = app;