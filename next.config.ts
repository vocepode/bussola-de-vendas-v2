import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // We render HTML coming from Notion export / DB.
  // This is intentionally allowed and should be sanitized at import time if needed.
  webpack: (config, { dev }) => {
    if (dev) {
      // Evita EMFILE em repos com pastas grandes (export do Notion / assets copiados).
      config.watchOptions = {
        ...(config.watchOptions ?? {}),
        ignored: /([\\/]+bussola completa com exemplos [\\/]|[\\/]+public[\\/]+notion-assets[\\/])/,
      };
    }
    return config;
  },
};

export default nextConfig;

