const express = require('express');
const multiparty = require('multiparty');
const util = require('util');
const multer  = require('multer');
const router = express.Router();
require('../stacktrace');
const fs = require('fs');
os = require('os');

const upload_dir = `${os.tmpdir()}/uploads`;




module.exports = function (database, storageBucket) {

    /* GET home page. */
    router.post('/', function(req, res, next) {

        if(req.user === null){
            res.status(403).send('Unauthorized');
            return;
        }

        console.log('line', __line);

        let form = new multiparty.Form({dest: upload_dir});

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

        if(req.user === null){
            res.status(403).send('Unauthorized');
            return;
        }

        let token = req.query.token;
        console.log(`token = ${token}`);
        let email = req.user.email;

        let file_location = `${token}.wav`;

        storageBucket.upload(`${upload_dir}/${token}`, {
                    destination: `unapproved/${file_location}`
        }).then(() => {

            database.ref('unapproved').push({file: file_location, email: email}, err => {
                if(err){
                    console.log(err);
                    res.status(500).send("error");
                    return;
                }
                fs.unlink(`${upload_dir}/${token}`, (e) => {
                    if (e){
                        console.log(e);
                        res.status(500).send("error");
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