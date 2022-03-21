const express = require('express');
const Busboy = require('busboy');
const nameGenerator = require('../util/nameGenerator');
const router = express.Router();
require('../stacktrace');
const fs = require('fs');
const path_joiner = require("path");
os = require('os');

const upload_dir = os.tmpdir();





module.exports = function (database, storageBucket) {

    /* GET home page. */
    router.post('/', function(req, res, next) {

        if(req.user === null){
            res.status(403).send('Unauthorized');
            return;
        }

        let file_name = nameGenerator(7);


        let busboy = Busboy({ headers: req.headers });

        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {

            let tpath = path_joiner.join(upload_dir,file_name);
            console.log(tpath);
            let writeStream = fs.createWriteStream(tpath);
            file.pipe(writeStream);
            writeStream.on('finish', () => {
                console.log('Done Writing File');
                res.send(file_name);
            });

        });


        busboy.on('finish', function() {
            console.log('Done parsing form!');
        });
        busboy.end(req.rawBody);



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
                // fs.unlink(`${upload_dir}/${token}`, (e) => {
                //     if (e){
                //         console.log(e);
                //         res.status(500).send("error");
                //         return;
                //     }
                //     res.send('yayyyy');
                // });
                res.send('yayyyy');
            });
        }).catch(e => {
            console.log("error", e);
            res.status(500).send("error");
        });


    });


    //
    return router;
};