
const util = {

  objToQuery: function (obj) {
    let query = [];
    if (!obj) {
      return '';
    }
    for (let i in obj) {
      query.push(i + '=' + encodeURIComponent(obj[i]));
    }
    return query.join("&");
  },
  getToken: function () {
    if (localStorage.token) {
      return localStorage.token
    } else {
      return '';
    }
  },
  post: function (url, param = {}) {
    let token = '';
    if (localStorage && localStorage.token) {
      token = localStorage.token;
    }
    param.token = token;
    let bodyParam = new URLSearchParams();
    for (let key in param) {
      bodyParam.append(key, param[key]);
    }
    return axios.post(url, bodyParam).then(res => res.data);

  },
  get: function (url, param = {}) {
    let query = this.objToQuery(param);
    let token = '';
    if (localStorage && localStorage.token) {
      token = localStorage.token;
    }
    let split = '?';
    if (-1 != url.indexOf("?")) {
      split = '&';
    }
    url = url + split + 'token=' + token;
    return axios.get(url, {
      params: param
    }).then((res) => {
      return res.data
    });
  },
  open: function (url, param = {}) {
    let query = this.objToQuery(param);
    let token = '';
    if (localStorage && localStorage.token) {
      token = localStorage.token;
    }
    let split = '?';
    if (-1 != url.indexOf("?")) {
      split = '&';
    }
    url = window.API_PREFIX + url + split + 'token=' + token + "&" + query;
    return window.open(url);
  },

  confirmRequest: function (scope, url, param, success, reject) {
    scope.$confirm('确定此操作吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      this.post(url, param).then((json) => {
        console.log(json);
        if (json.errno == 0) {
          scope.$message({
            type: 'success',
            message: '操作成功'
          });
          success && success(json);
        } else {
          scope.$message({
            type: 'info',
            message: '操作失败:' + json.errmsg
          });
          reject && reject(json);
        }

      }).catch((e) => {
        throw e;
        scope.$message({
          type: 'info',
          message: '操作失败'
        });
        reject && reject();
      });
    })
      .catch(() => {
        scope.$message({
          type: 'info',
          message: '已取消'
        });
        reject && reject();
      });
  }
}