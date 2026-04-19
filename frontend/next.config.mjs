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
};

export default nextConfig;
