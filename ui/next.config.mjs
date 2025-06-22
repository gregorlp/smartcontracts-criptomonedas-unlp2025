/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Configuración para Wagmi/Viem en el servidor
    if (isServer) {
      config.externals.push('pino-pretty', 'lokijs', 'encoding')
    }
    
    // Resolver problemas con módulos de Node.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    }

    return config
  },
  // Configuración para el entorno de producción
  experimental: {
    esmExternals: 'loose',
  },
  // Optimización para Vercel
  transpilePackages: ['wagmi', 'viem', '@tanstack/react-query'],
}

export default nextConfig
