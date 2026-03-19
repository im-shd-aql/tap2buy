module.exports = {
  apps: [
    {
      name: "tap2buy-api",
      cwd: "./api",
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      node_args: "--max-old-space-size=256",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      env_file: "./api/.env",
    },
    {
      name: "tap2buy-web",
      cwd: "./web",
      script: "node_modules/.bin/next",
      args: "start -p 3001",
      instances: 1,
      exec_mode: "fork",
      node_args: "--max-old-space-size=384",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
    {
      name: "tap2buy-landing",
      cwd: "./landing",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      node_args: "--max-old-space-size=256",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
