const express = require('express');
const multiparty = require('multiparty');
const util = require('util');
const multer  = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
require('../stacktrace');
const fs = require('fs');





module.exports = function (database, storageBucket) {


    /* GET home page. */
    router.post('/', function(req, res, next) {
        let form = new multiparty.Form({uploadDir: './uploads'});

        form.parse(req, function(err, fields, files) {

            if(err){
                console.log(err);
                res.send(err);
                return;
            }

            let file_path = files.ohbarak[0].path;

            let file_name = file_path.split('/')[1];

            res.send(file_name);
        });
    });


    router.get('/', function(req, res, next) {
        let token = req.query.token;

        let file_location = `${token}.wav`;

        storageBucket.upload(`uploads/${token}`, {
                    destination: `unapproved/${file_location}`
        }).then(() => {

            database.ref('unapproved').push(file_location, err => {
                if(err){
                    console.log(err);
                    res.send(err);
                    return;
                }
                fs.unlink(`uploads/${token}`, (e) => {
                    if (e){
                        console.log(e);
                        res.send(e);
                        return;
                    }
                    res.send('yayyyy');
                });
            });
        }).catch(e => {
            console.log("error", e);
            res.status(500).send("error");
        });


    });


    //
    return router;
};