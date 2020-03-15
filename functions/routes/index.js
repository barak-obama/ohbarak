const express = require('express');
const router = express.Router();
const get_formated_date = require("../util/get_formated_date");






function getTrack(bucket, token){

    return new Promise(function (resolve, reject) {
        let filePath = `approved/${token}`;

        // admin.storage().file(filePath).getSignedUrl({action: "read", expires: "01-01-2019"}, console.log);
        // admin.storage().bucket(fileBucket)
        bucket.file(filePath).getSignedUrl({
            action: "read",
            expires: get_formated_date()}
        ).then(function (url){
            resolve(url[0]);
        });
    });
}


function getApprovedTracks(database, bucket){
    let ohbaraks = [];

    let promises = [];
    return new Promise(function (resolve, reject) {
        database.ref('approved').once('value', function (audio_files) {

            audio_files = audio_files.val();

            for (let key in audio_files) {
                const file_name = audio_files[key].file;

                let ohbarak = {
                    nsfw: file_name.includes("nsfw")
                };


                promises.push(getTrack(bucket, file_name).then(url => {
                    ohbarak.url = url;
                    ohbaraks.push(ohbarak);
                    return ohbaraks;
                }));
            }

            return Promise.all(promises)
                .then(() => {
                resolve(ohbaraks);
            });
        });
    });

}



module.exports = function (database, storageBucket) {

    /* GET home page. */
    router.get('/', function(req, res, next) {


        getApprovedTracks(database, storageBucket).then(ohbaraks => {
            return res.render('index', {
                ohbaraks: JSON.stringify(ohbaraks),
                user: req.user
            });
        }).catch(err => {
            res.send(err);
            throw err;
        });
    });

    return router;

};
