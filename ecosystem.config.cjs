module.exports = {
  apps: [
    {
      name: "spiderheck-docs",
      script: "node",
      args: "server.js",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
