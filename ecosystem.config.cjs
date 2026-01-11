// PM2 Configuration for Soothe x CARE CUBE Japan
// Development environment with Wrangler Pages Dev + D1

module.exports = {
  apps: [
    {
      name: 'soothe-care-cube-jp',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=soothe-db-production --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '1G'
    }
  ]
}