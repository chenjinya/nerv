const jwt = require('jsonwebtoken')

const jwtSecretKey = 'eva@2019';
const jwtConf = {
  algorithm: 'HS256',
  expiresIn: '1d'
};

module.exports = {
  verifyToken: function (token) {
    try {
      return jwt.verify(token, jwtSecretKey);
    } catch (err) {
      console.error(err);
      return false;
    }
  },
  genToken: function (data) {
    return jwt.sign(data, jwtSecretKey, jwtConf);
  },
  decodeToken: function (token) {
    try {
      return jwt.decode(token);
    } catch (err) {
      console.error(err);
      return false;
    }
  }

}
