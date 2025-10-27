/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- Existing Configuration ---
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
  // --- FIX: Custom headers for Content Security Policy (CSP) ---
  // This allows 'unsafe-eval' needed for Mermaid.js to function and display the Network Topology.
  // ... (rest of nextConfig object) ...
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            // FIX: Added http://localhost:5000 to connect-src to allow API calls
            value: `default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://localhost:5000 https:;`,
          },
        ],
      },
    ]
  },
// ... (rest of file) ...
}

module.exports = nextConfig