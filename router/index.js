
let cmd = require('./cmd')
let login = require('./login')
let auth = require('./auth')

let define = require('../define')
module.exports = function (app) {

  app.get('/', function (req, res) {
    res.render('index/login', {
      title: "服务器补完计划",
      header: "Some users"
    });
  });

  app.get('/monitor', function (req, res) {
    res.render('index/index', {
      title: "服务器补完计划",
      header: "Some users"
    });
  });
  app.get('/login', login);
  app.get('/auth', auth);
  app.get('/cmd', cmd)

}