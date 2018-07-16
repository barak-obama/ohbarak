const express = require('express');
const authCheck = require('./AuthCheck');
require('../stacktrace');
const router = express.Router();
const multer = require('multer');
var upload = multer();



function getTrack(bucket, token) {

    return new Promise(function (resolve, reject) {
        let filePath = `unapproved/${token}`;

        bucket.file(filePath).getSignedUrl({
                action: "read",
                expires: "01-01-2019"
            }
        ).then(function (url) {
            resolve(url[0]);
        });
    });
}


function getUnapprovedTracks(database, bucket) {
    let ohbaraks = [];

    let promises = [];
    return new Promise(function (resolve, reject) {
        database.ref('unapproved').once('value', function (audio_files) {
            audio_files = audio_files.val();

            for (let key in audio_files) {
                const file_name = audio_files[key];

                promises.push(getTrack(bucket, file_name).then(url => {
                    ohbaraks.push({
                        url: url,
                        token: key
                    });
                }));
            }

            Promise.all(promises).then(() => {
                resolve(ohbaraks);
            });
        });
    });

}


function approve(storageBucket, database, token, name, nsfw) {

    return move(storageBucket, database, token, name, nsfw, 'approved');

}

function reject(storageBucket, database, token, name, nsfw) {

    return move(storageBucket, database, token, name, nsfw, 'reject');

}

function move(storageBucket, database, token, name, nsfw, to){
    let ref = database.ref(`unapproved/${token}`);

    return new Promise(function (resolve, reject) {
        ref.once('value', function (filename) {
            filename = filename.val();
            if(!filename){
                reject("No such file");
            }


            let new_ref = database.ref(to).push();

            let nsfw_suffix = '';
            if (nsfw) {
                nsfw_suffix = '.nsfw';
            }

            let approved_name = `${new_ref.key}_${name}${nsfw_suffix}.wav`;


            new_ref.set(approved_name);

            storageBucket
                .file(`unapproved/${filename}`)
                .move(`${to}/${approved_name}`).then(() => {
                ref.remove(err => {
                    if (err) {
                        reject(err);
                        throw err;
                    }
                    resolve()
                });
            }).catch(reject);
        });
    });
}


function isAdmin(database, unauthorized) {
    return (req, res, next) => {
        database.ref('admin').once('value', function (admins) {
            admins = Object.values(admins.val());

            if (admins.includes(req.user.user_id))
                next();
            else
                unauthorized(res, req);
        });
    }
}


module.exports = function (database, storageBucket, auth) {


    let sighInAuthCheck = authCheck.authCheck(auth, (req, res, next) => {
        res.render('sighIn');
    });

    let admin_redirect = isAdmin(database, (req, res) => res.render('404'));
    let admin_unauthorized = isAdmin(database, (req, res) => res.status(403).send('Unauthorized'));

    /* GET home page. */
    router.get('/', sighInAuthCheck, admin_redirect, function (req, res, next) {
        getUnapprovedTracks(database, storageBucket).then(ohbaraks => {
            res.render('approve', {
                ohbaraks: ohbaraks,
                empty: ohbaraks.length === 0
            }, );
        });
    });


    router.post('/:decision', function (req, res) {
        let approved = req.params.decision === 'approve';
        let token = req.body.token;
        let name = req.body.name || "";
        let nsfw = req.body.nsfw || false;


        console.log("body ", typeof(req.body));
        console.log("token ", req.body.token);
        if (approved) {
            approve(storageBucket, database, token, name, nsfw).then(() => {
                res.status(200).send("approved");
            })
                .catch(err => {
                    res.status(500).send(err);
                });


        } else {

            reject(storageBucket, database, token, name, nsfw).then(() => {
                res.status(200).send("rejected");
            })
                .catch(err => {
                    res.status(500).send(err);
                });

            res.send("Not Supported")
        }
    });

    return router;

};
