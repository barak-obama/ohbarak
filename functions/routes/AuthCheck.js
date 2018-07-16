


const validateFirebaseIdToken = (req, res, next, auth, unauthorized) => {
    // console.log('Check if request is authorized with Firebase ID token');

    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.');
        unauthorized(req, res, next);
        return;
    }

    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        // console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else if(req.cookies) {
        // console.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    } else {
        // No cookie
        unauthorized(req, res, next);
        return;
    }
    // console.log('idToken', idToken);
    auth.verifyIdToken(idToken).then((decodedIdToken) => {
        // console.log('ID Token correctly decoded', decodedIdToken);
        req.user = decodedIdToken;
        return next();
    }).catch((error) => {
        console.error('Error while verifying Firebase ID token:', error);
        unauthorized(req, res, next);
    });
};


function authCheck(auth, unauthorized) {
    return (req, res, next) => {
        validateFirebaseIdToken(req, res, next, auth, unauthorized)
    }
}

module.exports.status403 = function (auth) {
    return authCheck(auth, (req, res, next) => {
        res.status(403).send('Unauthorized');
    })
};

module.exports.authCheck = authCheck;