module.exports = {
  apps: [
    {
      name: 'supplio-backend',
      script: 'dist/src/main.js',
      cwd: '/root/supplio/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
    {
      name: 'supplio-landing',
      script: 'npm',
      args: 'start',
      cwd: '/root/supplio/landing',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
