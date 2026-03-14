module.exports = {
  apps: [
    {
      name: 'vigiliajovem-backend',
      script: 'backend/index.js', // Caminho correto do script
      
      exec_mode: 'fork', // Força o modo 'fork'
      instances: 1, // Garante uma única instância
      
    //  autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      cron_restart: "0 */6 * * *",
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};