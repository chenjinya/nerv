const express = require('express')
const app = express()
const path = require('path');
const qomo = require("qomolangma");
const router = require('./router');

const port = 20163

// respond with "hello world" when a GET request is made to the homepage
app.set('view engine', 'ejs')
app.set('view engine', 'html');
app.engine('.html', require('ejs').__express);

// Optional since express defaults to CWD/views
app.set('views', path.join(__dirname, 'views'));
// Path to our public directory
app.use(express.static(path.join(__dirname, 'public')));

router(app);

app.listen(port, '0.0.0.0', () => console.log(`Example app listening on port ${port}!`))