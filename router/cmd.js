const qomo = require("qomolangma");
const token = require('../token');


const defaultRemotes = [
  {
    host: '111.222.333.444',
    tag: 'search',
  },
  
  ];

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
  } else {
    return res.send(JSON.stringify({
      error: 'TOKEN_EMPTY'
    }));
  }

  let cmd = req.query.cmd;
  if (!cmd) {
    return res.send("[]");
  }
  let remotes = defaultRemotes;
  if (req.query.remotes) {
    remotes = JSON.parse(req.query.remotes);
  }
  qomo.remote.set(remotes);
  console.log(qomo.remote.get());

  let datas = [];
  qomo.command(cmd, (err, data, counter) => {
    console.log(err, data, counter)
    datas.push(data);
    if (counter.count == datas.length) {
      res.send(JSON.stringify(datas));
    }
  });
};