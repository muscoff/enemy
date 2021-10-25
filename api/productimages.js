const express = require('express');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

const app = express();

app.get('/:img', (req, res)=>{
    let img = req.params.img;

    let dirpath = path.parse(__dirname);

    let filepath = path.join(dirpath.dir, 'images', 'products', img);

    fs.exists(filepath, exist=>{
        if(!exist){
            res.setHeader('Content-type', 'text/plain');
            res.status(404);
            res.end('NOT FOUND');
        }else{
            res.setHeader('Content-type', mime.contentType(img));
            res.status(200);
            fs.readFile(filepath, (err, content)=>{
                if(!err){
                    res.end(content);
                }
            });
        }
    });
});

module.exports = app;