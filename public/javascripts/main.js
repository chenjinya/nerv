(function () {
  const setCache = function (k, v) {
    localStorage[k] = (typeof v == 'object') ? JSON.stringify(v) : v
  }

  const getCache = function (k, def = null) {
    return localStorage[k] ? ((typeof def == 'object') ? JSON.parse(localStorage[k]) : localStorage[k]) : def;


  }
  const default_remotes = [

    // {
    //   tag: "search",
    //   host: "172.17.252.106",
    // },
    {
      tag: "console",
      host: "172.17.252.100",
    },
    {
      tag: "backup",
      host: "172.17.252.98",
    },
    {
      tag: "load",
      host: "172.17.252.99",
    },
    {
      tag: "master",
      host: "172.17.252.95",
    }
  ];
  let main_screen_content = [];
  let vm = new Vue({
    el: '#app',
    created: function () {
      util.get("/auth", {}).then((data) => {
        if (data === 'error') {
          return location.href = "/"
        }

        this.monitor.content = "歡迎駕駛員(パイロット歓迎 WELCOME): " + data.username.toUpperCase();
      }).catch((e) => {
        console.error(e);
        location.href = "/"
      })
    },
    watch: {
      draft: function (v) {
        setCache('draft', v);

      }
    },
    mounted: function () {
      this.monitor.content = "System is ready.";
      this.main_style.height = (window.innerHeight - 81 - 256 - 50) + 'px';


      this.monitor.sub_content = "";
      const lastCmdList = this.history.slice(0, 3);
      for (let c of lastCmdList) {
        this.appendToSubScreen("歷史執行: " + c);
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
      handelSelectRemote(remote) {
        if (this.set_remotes[remote.host]) {
          this.set_remotes[remote.host] = null;
        } else {
          this.set_remotes[remote.host] = remote;
        }
        setCache('set_remotes', this.set_remotes);
      },

      handelSetRemote(remote) {
        if (remote.tag == "all") {
          for (let item of default_remotes) {
            this.handelSetRemote(item)
          }
        } else {
          if (this.map_remotes[remote.host]) {
            return false;
          }
          this.map_remotes[remote.host] = remote;
          this.set_remotes[remote.host] = remote;
          this.list_remotes.push(remote);
        }
        setCache('map_remotes', this.map_remotes);
        setCache('set_remotes', this.set_remotes);
        setCache('list_remotes', this.list_remotes);

      },
      handelDelRemote(remote, index) {
        console.log(JSON.stringify(remote));
        this.map_remotes[remote.host] = null;
        this.set_remotes[remote.host] = null;
        this.list_remotes.splice(index, 1);
        console.log(this.set_remotes)
        setCache('map_remotes', this.map_remotes);
        setCache('set_remotes', this.set_remotes);
        setCache('list_remotes', this.list_remotes);

      },
      handelHistoryUp() {
        let his = getCache('history', []);
        if (this.history_offset >= his.length - 1) {
          return false;
        }

        this.history_offset++
        this.command = his[this.history_offset];
      },
      handelHistoryDown() {
        if (this.history_offset <= 0) {
          this.history_offset = -1;
          return this.command = '';
        }
        this.history_offset--
        let his = getCache('history', []);
        this.command = his[this.history_offset];

      },
      appendToScreen(raw) {
        main_screen_content.push(`<div>${raw}</div>`)
        if (main_screen_content.length > 1000) {
          main_screen_content.splice(0, 1);
        }
        this.monitor.content = main_screen_content.join("");
        this.$nextTick(() => {
          document.getElementById('nervScreen').scrollTo(0, 9999999)
        })
      },
      appendToSubScreen(raw) {
        let addon = '';
        addon += `<div>${raw}</div>`;
        this.monitor.sub_content += addon;
        this.$nextTick(() => {
          document.getElementById('nervSubScreen').scrollTo(0, 9999999)
        })
      },
      handelLogout: function () {
        setCache('token', '')
        location.href = '/';
      },
      onSubmit: function () {
        let his = getCache('history', []);
        if (his[0] != this.command) {
          if (his.length >= 100) {
            his = his.slice(0, 99);
          }
          his.unshift(this.command)
          setCache("history", his)
        }

        this.history_offset = -1;
        this.handelCommand();
      },
      handelClean: function () {
        this.monitor.content = "Cleaned";
      },
      handelCommand: function () {
        if (!this.command) {
          this.appendToScreen("命令为空");
          return true;
        }
        this.appendToSubScreen("執行: " + this.command);
        this.execCommand(this.command);
        this.command = '';
      },
      execCommand: function (cmd) {
        let remotes = [];
        for (let h in this.set_remotes) {
          console.log(JSON.stringify(h))
          if (!!this.set_remotes[h]) {
            remotes.push(this.set_remotes[h])
          }

        }
        if (remotes.length == 0) {
          this.appendToScreen("請選擇遠程機器地址");
          return false;
        }
        this.monitor.loading = true;
        this.appendToScreen("<span style='color: black;background: red; padding: 4px;' >命令</span> " + cmd);
        this.last_command = cmd;
        if (!!this.command_path) {
          setCache('command_path', this.command_path);
          cmd = `cd ${this.command_path} && ` + cmd;
        }

        util.get("/cmd", {
          'cmd': cmd,
          'remotes': JSON.stringify(remotes)
        }).then((data) => {
          if (!data.error) {
            let addon = '';
            for (pack of data) {

              let output = (pack.output ? pack.output : '');
              addon += `<div class="nerv-monitor-host" >Hostname: ${pack.hostname} IP: ${pack.ip} cost: ${pack.cost}ms </div>`;
              addon += `<pre class="nerv-monitor-content">${pack.error ? '[Error]' + pack.error : ''}${output}</pre>`;
            }
            this.appendToScreen(addon);
            this.monitor.loading = false;

          } else {
            this.monitor.loading = false;
            this.showError(data.error)
          }


        }).catch((e) => {
          console.error(e);
          this.monitor.content += `<div class="nerv-monitor-error>` + "[Error]" + JSON.stringify(e) + "</div>";
          this.monitor.loading = false;
        })
      },
      selectRemotes: function () {
        let remote = this.default_remotes[this.remote_index];
        let remotes = default_remotes;
        if (remote.tag == 'all') {
          remotes = [].concat(default_remotes);
          remotes.shift();
        } else {
          remotes = [remote];
        }
        return remotes;
      },
      handelConnect: function () {

        this.execCommand('cat /proc/loadavg');
      },

    },
    data: () => {
      return {
        history_offset: -1,
        history: getCache('history', []),
        sending: false,
        main_style: {
          height: 'auto',
        },
        draft: getCache('draft', ''),
        monitor: {
          loading: false,
          sub_content: 'loading...',
          content: "initing..."
        },
        remote_index: 0,
        command: "",
        command_path: getCache('command_path', ''),
        last_command: '',
        remotes: {},
        list_remotes: getCache("list_remotes", []),
        set_remotes: getCache('set_remotes', {}),
        map_remotes: getCache('map_remotes', {}),
        default_remotes: [
          {
            tag: 'all',
            host: '*'
          }
        ].concat(default_remotes),

        show_error: false,
        show_error_content: '',
        show_error_timeout: null,
      }
    }
  })
})()
