module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [

    // First application
    {
      name: 'NERV',
      script: 'index.js',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env_production: {
        RUNTIME_ENVIRONMENT: "PROD"
      },

    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy: {
    production: {
      user: 'work',
      host: [
        '172.17.252.106',//search
        '172.17.252.100',//console
        '172.17.252.98',//backup
        '172.17.252.99',//ecs-load
        '172.17.252.95'//ecs-master
      ],
      ref: 'origin/release/daily',
      repo: 'git@e.coding.net:ifaceparty/qomolangma.git',
      path: '/home/work/tools/Qomolangma/',
      "pre-setup": "rm -rf /home/work/tools/Qomolangma/",
      'post-deploy': 'npm install &&  pm2 reload ecosystem.config.js --env production',
    },
  }
};
