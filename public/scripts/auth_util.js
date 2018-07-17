let provider = new firebase.auth.GoogleAuthProvider();

function popup_signing() {
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
//            let token = result.credential.accessToken;

        firebase.auth().currentUser.getIdToken(true).then(function(token) {

            document.cookie = `__session=${token} ;max-age=3600`;

            location.reload();

            console.log(token);
        }.bind(this));



//            location.reload();
        // ...
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });
}

function signOut() {
    firebase.auth().signOut().then(function() {
        document.cookie = '__session=;max-age=0';
        location.href = '/';
    }, function(error) {
        console.error('Sign Out Error');
    });
}
