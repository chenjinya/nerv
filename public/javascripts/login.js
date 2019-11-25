(function () {

  let vm = new Vue({
    el: '#app',
    mounted: function () {
      if (localStorage.username) {
        this.username = localStorage.username
      }
    },
    methods: {
      showError: function (content) {
        this.show_error = true;
        this.show_error_content = content;
        this.show_error_timeout = setTimeout(() => {
          this.show_error = false;
          this.show_error_content = '';
        }, 2000)
      },
      handelLogin: function () {
        this.logining = true;

        setTimeout(() => {
          if (!this.username) {
            this.logining = false;
            return this.showError("駕駛員身份未識別");
          }
          if (!this.password) {
            this.logining = false;
            return this.showError("駕駛員口令未註冊");
          }
          util.get("/login", {
            'username': this.username,
            'password': this.password
          }).then((data) => {
            if (!data.error) {
              localStorage.username = this.username;
              localStorage.token = data.token;
              this.$nextTick(() => {
                location.href = "/monitor";

                // window.scrollTo(0, 9999999)
              })
            } else {
              this.logining = false;
              this.showError(data.error);
            }


          }).catch((e) => {
            this.logining = false;
            console.error(e);

          })
        }, 2000)
      },

    },
    data: () => {
      return {
        show_error: false,
        show_error_content: '',
        show_error_timeout: null,
        sending: false,
        logining: false,
        username: '',
        password: '',

      }
    }
  })
})()
