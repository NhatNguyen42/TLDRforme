/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.hoyolab.com' },
      { protocol: 'https', hostname: '**.mihoyo.com' },
      { protocol: 'https', hostname: '**.ytimg.com' },
      { protocol: 'https', hostname: '**.bilibili.com' },
      { protocol: 'https', hostname: '**.hdslb.com' },
      { protocol: 'https', hostname: '**.prydwen.gg' },
      { protocol: 'https', hostname: '**.game8.co' },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
