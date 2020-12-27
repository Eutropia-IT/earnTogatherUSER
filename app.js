require('dotenv').config();
const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');
const hbs = require("hbs");
hbs.registerHelper("equal", require("handlebars-helper-equal"));
hbs.registerHelper('dateFormat', require('handlebars-dateformat'));

const pagesRouter = require('./routes/pagesRouter');

const session = require('express-session');
const flash = require('connect-flash');

const MysqlStore = require('express-mysql-session')(session);

const sessionDB = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
}
const sessionStore = new MysqlStore(sessionDB);



//create app................(APP)
const app = express();

app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

app.use(session({
    secret: process.env.SEASON_SECRET_KEY,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
}));


const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(flash());

// page middleware
app.use('/', pagesRouter);


const sslServer = https.createServer({
    cert: fs.readFileSync(path.join(__dirname,'/ssl/cert.pem')),
    key: fs.readFileSync(path.join(__dirname,'/ssl/key.pem')),
    ca: fs.readFileSync(path.join(__dirname,'/ssl/ca.pem'))
}, app);

/**server */
sslServer.listen(8000, ()=>{
    console.log('server ok 8000');
});