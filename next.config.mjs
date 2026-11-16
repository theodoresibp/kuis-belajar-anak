/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets the dev server accept requests from phones/tablets on the same
  // Wi-Fi testing against the LAN IP (otherwise Next.js 16 blocks the
  // cross-origin dev requests and the page loads with no JS attached).
  allowedDevOrigins: ["10.176.30.109"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "commons.wikimedia.org",
        pathname: "/wiki/Special:FilePath/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
