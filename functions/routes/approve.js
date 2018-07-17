const express = require('express');
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
                const file_name = audio_files[key].file;
                const email = audio_files[key].email;

                promises.push(getTrack(bucket, file_name).then(url => {
                    ohbaraks.push({
                        url: url,
                        token: key,
                        email: email
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
    return move(storageBucket, database, token, name, nsfw, 'rejected');
}

function move(storageBucket, database, token, name, nsfw, to){
    let ref = database.ref(`unapproved/${token}`);

    return new Promise(function (resolve, reject) {
        ref.once('value', function (fileinfo) {
            fileinfo = fileinfo.val();

            if(!fileinfo){
                reject("No such file");
            }

            let filename = fileinfo.file;
            let email = fileinfo.email;


            let new_ref = database.ref(to).push();

            let nsfw_suffix = '';
            if (nsfw) {
                nsfw_suffix = '.nsfw';
            }

            let approved_name = `${new_ref.key}_${name}${nsfw_suffix}.wav`;


            new_ref.set({file: approved_name, email:  email});

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





module.exports = function (database, storageBucket) {

    /* GET home page. */
    router.get('/', function (req, res, next) {

        if(req.user === null || req.user.is_admin === false){
            res.render('404');
            return;
        }

        getUnapprovedTracks(database, storageBucket).then(ohbaraks => {
            res.render('approve', {
                ohbaraks: ohbaraks,
                empty: ohbaraks.length === 0,
                user: req.user
            }, );
        });
    });


    router.post('/:decision', function (req, res) {

        if(req.user === null || req.user.is_admin === false){
            res.status(403).send('Unauthorized');
        }

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
                    console.error(err);
                    res.status(500).send(err);
                });


        } else {

            reject(storageBucket, database, token, name, nsfw).then(() => {
                res.status(200).send("rejected");
            })
                .catch(err => {
                    console.error(err);
                    res.status(500).send(err);
                });

            res.send("Not Supported")
        }
    });

    return router;

};
