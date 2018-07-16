const functions = require('firebase-functions');
const admin = require('firebase-admin');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
var bodyParser = require('body-parser')



const serviceAccount = require("./ohbarak-42e3f-firebase-adminsdk-2num4-f8fe27238e.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ohbarak-42e3f.firebaseio.com"
});

const fileBucket = "gs://ohbarak-42e3f.appspot.com";
const database = admin.database();
const storageBucket = admin.storage().bucket(fileBucket);
const auth = admin.auth();

const indexRouter = require('./routes/index')(database, storageBucket);
const recordRouter = require('./routes/record')();
const uploadRouter = require('./routes/upload')(database, storageBucket);
const approveRouter = require('./routes/approve')(database, storageBucket, auth);


const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

/* GET home page. */
app.use('/', indexRouter);
app.use('/record', recordRouter);
app.use('/upload', uploadRouter);
app.use('/approve', approveRouter);

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

exports.app = functions.https.onRequest(app);


