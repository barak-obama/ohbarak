const express = require('express');
const router = express.Router();



module.exports = function () {
    /* GET home page. */
    router.get('/', function(req, res, next) {
        res.render('record');
    });

    return router;
};
