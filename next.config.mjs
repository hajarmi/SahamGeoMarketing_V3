const disableStrictChecks = (process.env.NEXT_DISABLE_STRICT ?? "").toLowerCase() === "true"
const allowUnoptimizedImages = (process.env.NEXT_IMAGE_UNOPTIMIZED ?? "").toLowerCase() === "true"

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: disableStrictChecks,
  },
  typescript: {
    ignoreBuildErrors: disableStrictChecks,
  },
  images: {
    unoptimized: allowUnoptimizedImages,
  },
  productionBrowserSourceMaps: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
  experimental: {
    esmExternals: 'loose',
  },
}

export default nextConfig
