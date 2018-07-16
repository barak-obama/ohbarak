const express = require('express');
const router = express.Router();
const authCheck = require('./AuthCheck');



module.exports = function (auth) {

    let sighInAuthCheck = authCheck.authCheck(auth, (req, res, next) => {
        res.render('sighIn');
    });

    /* GET home page. */
    router.get('/',sighInAuthCheck, function(req, res, next) {
        res.render('record', {email: req.user.email});
    });

    return router;
};
