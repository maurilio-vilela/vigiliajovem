/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Gera arquivos estáticos
  trailingSlash: true, // Garante que as rotas terminem com barra (opcional)
  images: {
        unoptimized: true, // Desativa a otimização de imagens para exportação estática
    },
};

module.exports = nextConfig;
