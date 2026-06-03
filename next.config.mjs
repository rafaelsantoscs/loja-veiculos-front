//  /** @type {import('next').NextConfig} */
//  const nextConfig = {
//      images: {
//          domains: ['192.168.20.173', 'localhost', '147.79.81.216', 'anotherdomainaqui.com'], // Adicione os domínios necessários aqui
//        },
//  };

//  export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.20.222',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        
      },
      {
        protocol: 'http',
        //casa
        hostname: '192.168.100.14',
        
      },
      {
        protocol: 'http',
        hostname: '192.168.20.32',
        
      },
      {
        protocol: 'http',
        hostname: '192.168.20.252',
        
      },
      {
        protocol: 'http',
        hostname: '192.168.1.5',
        
      },
      {
        protocol: 'https',
        hostname: 'd9a1-187-19-199-178.ngrok-free.app',
        
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8085',
        pathname: '/frota-vsa/uploads/colaboradores/**',
      },
      {
        protocol: 'http',
        hostname: '145.223.92.20',
        
      },
      {
        protocol: 'https',
        hostname: 'api-frotavsa.iamtec.org',
        
      },
      {
        protocol: 'https',
        hostname: 'frotavsa.iamtec.org',
        
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
        
      },
    ],
  },
  
};

export default nextConfig;


