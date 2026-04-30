module.exports = {
  apps: [
    {
      name: "api",
      script: "dist/server.js",
      instances: "max",
      exec_mode: "cluster",
      node_args: "--max-old-space-size=512",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      watch: false,
      max_memory_restart: "500M",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};