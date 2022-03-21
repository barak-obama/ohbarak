const express = require('express');
const router = express.Router();



module.exports = function () {

    /* GET home page. */
    router.get('/', function(req, res, next) {
        if(req.user === null) {
            res.render('sighIn');
            return;
        }
        res.render('record', {user: req.user});
    });

    return router;
};
