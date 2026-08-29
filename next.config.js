/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Capacitor / statik export için: `npm run build:cap` ile açın
  // output: 'export',
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        { key: "Service-Worker-Allowed", value: "/" },
      ],
    },
    {
      source: "/manifest.json",
      headers: [
        { key: "Content-Type", value: "application/manifest+json" },
      ],
    },
  ],
};

module.exports = nextConfig;
