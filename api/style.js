const express = require('express');
const formidable = require('formidable');
const Joi = require('joi');
const path = require('path');
const fs = require('fs');
const db = require('../dbconnect');
const appurl = require('../weblink');
const port = process.env.PORT || 4000;

const weblink = `${appurl}:${port}`;

const app = express();

app.get('/', (req, res)=>{
    let sql = "SELECT * FROM `custom_style`";

    db.query(sql, (err, result)=>{
        if(err){
            res.send({msg: err.sqlMessage});
            res.end();
        }else{
            res.send(result);
            res.end();
        }
    });
});

app.post('/', (req, res)=>{
    let sql = "INSERT INTO `custom_style` SET ?";
    const form = formidable({multiples: false});

    form.parse(req, (err, fields, files)=>{
        if(files.img){
            let {error, value} = validateStyleInput(fields);
            if(error){
                res.send({status: false, msg: error.details[0].message});
                res.end();
            }else{
                let rand = Math.floor(Math.random()*1000000000);
                const dirName = path.parse(__dirname);
                const oldPath = files.img.path;
                let filename = rand.toString() + files.img.name;
                const filesize = files.img.size;
                const dbName = weblink + '/images/general/' + filename;
                const maxSize = 2097152;
                const destination = path.join(dirName.dir, 'images', 'general', filename);
                value.img = dbName;

                // if(filesize <= maxSize){
                    fs.exists(destination, exists=>{
                        if(exists){
                            res.send({status: false, msg: 'A file with same name already exist. Try again'}),
                            res.end();
                        }else{
                            fs.rename(oldPath, destination, (err)=>{
                                if(err){
                                    res.send({status: false, msg: 'Failed to upload file. Input not recorded. Try again'});
                                    res.end();
                                }else{
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
                //     res.send({status: false, msg: 'Image size must be 2MB or less'});
                //     res.end();
                // }
            }
        }else{
            res.send({status: false, msg: 'Image file is required'});
            res.end();
        }
    });
});

validateStyleInput = input => {
    const schema = Joi.object({
        buttonName: Joi.string().min(3).max(15).required(),
        subtitle: Joi.string().min(4).max(25).required(),
        title: Joi.string().min(3).max(30).required(),
        content: Joi.string().required(),
        link: Joi.string().required()
    });

    return schema.validate(input);
}

module.exports = app;