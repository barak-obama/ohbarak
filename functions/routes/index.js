const express = require('express');
const router = express.Router();





function getTrack(bucket, token){

    return new Promise(function (resolve, reject) {
        let filePath = `approved/${token}`;

        // admin.storage().file(filePath).getSignedUrl({action: "read", expires: "01-01-2019"}, console.log);
        // admin.storage().bucket(fileBucket)
        bucket.file(filePath).getSignedUrl({
            action: "read",
            expires: "01-01-2019"}
        ).then(function (url){
            resolve(url[0]);
        });
    });
}


function getApprovedTracks(database, bucket){
    let ohbaraks = [];

    let promises = [];
    return new Promise(function (resolve, reject) {
        database.ref('approved').on('value', function (audio_files) {
            audio_files = Object.values(audio_files.val());

            for(let i = 0; i < audio_files.length; i++){
                const file_name = audio_files[i];
                const token = file_name;

                let ohbarak = {
                    nsfw: file_name.includes("nsfw")
                };


                promises.push(getTrack(bucket, token).then(url => {
                    ohbarak.url = url;
                    ohbaraks.push(ohbarak);
                }));
            }

            Promise.all(promises).then(() => {
                resolve(ohbaraks);
            });
        });
    });

}



module.exports = function (starCountRef, storageBucket) {

    /* GET home page. */
    router.get('/', function(req, res, next) {
        getApprovedTracks(starCountRef, storageBucket).then(ohbaraks => {
            res.render('index', {
                ohbaraks: JSON.stringify(ohbaraks)
            });
        });
    });

    return router;

};
