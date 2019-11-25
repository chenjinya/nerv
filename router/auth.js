
const token = require('../token');

module.exports = function (req, res) {
  console.log(req.query);
  let t = req.query.token;

  if (t) {
    const raw = token.verifyToken(t)
    if (raw === false) {
      return res.send(JSON.stringify({
        error: 'TOKEN_VERITY_FAIL'
      }));
    }
    return res.send(JSON.stringify(raw));
  } else {
    return res.send(JSON.stringify({
      error: 'TOKEN_EMPTY'
    }));
  }


};