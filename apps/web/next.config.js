/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-commonjs */

/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: [
    "pdfjs-dist",
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure native Node bindings (e.g. canvas.node) bundled by pdfjs-dist are ignored
  webpack: (config, { webpack }) => {
    // 1. Alias the optional native canvas dependency to a stub so webpack doesn't try to bundle it
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: false,
    };

    // 2. Skip parsing .node binaries altogether
    config.module.rules.push({
      test: /\.node$/,
      type: "asset/resource",
    });

    // Ignore the optional `canvas` package entirely to prevent Webpack from walking into native bindings
    config.plugins = config.plugins || [];
    config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^canvas$/ }));

    return config;
  },
  // Mark Node-specific core modules as empty so they don't break client bundles
  experimental: {
    esmExternals: "loose",
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

/**
 * Use bundle analyzer only when ANALYZE env is set, avoiding top-level require.
 */
const getConfig = () => {
  if (process.env.ANALYZE === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: true });
    return withBundleAnalyzer(nextConfig);
  }
  return nextConfig;
};

module.exports = getConfig();