/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  typescript: {
    // Disable type checking since eslint handles this
    ignoreBuildErrors: true,
  },
}

if (process.env.NODE_ENV === 'development') {
  const withPreconstruct = require('@preconstruct/next')
  module.exports = withPreconstruct(config)
} else {
  module.exports = config
}
