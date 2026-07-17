import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},

  webpack: (config, { webpack }) => {
    // 1. Permanently ignore ALL optional @x402 AI payment packages (EVM, Solana SVM, etc.)
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@x402/,
      })
    );

    // 2. Silence common Node-specific peer dependency warnings from RainbowKit & Wagmi
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'pino-pretty': false,
      'lokijs': false,
      'encoding': false,
    };

    return config;
  },
};

export default nextConfig;
