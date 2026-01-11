// PM2 Configuration for Soothe x CARE CUBE Japan
// Development environment with Wrangler Pages Dev

module.exports = {
  apps: [
    {
      name: 'soothe-care-cube-jp',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false, // Disable PM2 file monitoring
      instances: 1, // Development mode uses only one instance
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '1G'
    }
  ]
}