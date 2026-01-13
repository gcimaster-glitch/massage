// PM2 Configuration for HOGUSY (massage project)
// Development environment with Wrangler Pages Dev + D1

module.exports = {
  apps: [
    {
      name: 'massage',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=hogusy-db-production --local --ip 0.0.0.0 --port 3000',
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