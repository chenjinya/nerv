
const token = require('../token');

const users = {
  'admin': 'admin'
}
module.exports = function (req, res) {
  console.log(req.query);
  let username = req.query.username;
  let password = req.query.password;

  if (users[username] && users[username] === password) {
    const t = token.genToken({
      username: username,
      datetime: Date.now()
    })
    return res.send({
      token: t
    });
  } else {
    return res.send(JSON.stringify({
      error: 'LOGIN_PASS_FAIL'
    }));
  }


};