module.exports = {
  apps: [
    {
      name: "3002",
      script: "ts-node",
      args: "server.ts --FLSmX=1024M --SdX=1024M --time=def --nogui",
      interpreter: "node",
      instances: 1,
      exec_mode: "cluster",
      max_memory_restart: "1024M",
      autorestart: false,
      combine_logs: true,
      output: "./logs/stream.log",
      error: "./logs/stream.log"
    }
  ]
}; 