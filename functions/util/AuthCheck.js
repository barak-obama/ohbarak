


const validateFirebaseIdToken = (req, res, next, auth, unauthorized) => {
    // console.log('Check if request is authorized with Firebase ID token');

    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.');

        req.user = null;
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
        req.user = null;
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
        req.user = null;
        unauthorized(req, res, next);
    });
};





function isAdmin(database, unauthorized) {
    return (req, res, next) => {

        if(!req.user || req.user === null) {
            unauthorized(req, res, next);
            return;
        }

        database.ref('admin').once('value', function (snapshot) {
            snapshot = snapshot.val();

            let admins;

            if(Array.isArray(snapshot)){
                admins = snapshot;
            } else {
                admins = [];
                for (let key in snapshot) {
                    admins.push(snapshot[key]);
                }
            }



            req.user.is_admin = admins.includes(req.user.email);

            if (req.user.is_admin)
                return next();
            else
                unauthorized(req, res, next);
        });
    }
}


function authCheck(auth, unauthorized) {
    return (req, res, next) => {
        validateFirebaseIdToken(req, res, next, auth, unauthorized)
    }
}

module.exports = function (auth, database) {
    return {
        status403: authCheck(auth, (req, res, next) => res.status(403).send('Unauthorized')),
        authCheck: unauthorized =>  authCheck(auth, unauthorized),
        authPass: authCheck(auth, (req, res, next) => next()),
        sighInAuthCheck: authCheck(auth, (req, res, next) => res.render('sighIn')),
        admin_redirect: isAdmin(database, (req, res, next) => res.render('404')),
        adminStatus403: isAdmin(database, (req, res, next) => res.status(403).send('Unauthorized')),
        admin_pass: isAdmin(database, (req, res, next) => next())
    }
};

