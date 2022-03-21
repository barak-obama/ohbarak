const express = require('express');
const router = express.Router();



module.exports = function () {

    /* GET home page. */
    router.get('/', function(req, res, next) {

        console.log('our team!!!');

        res.render('our_team', {user: req.user});
    });

    return router;
};
