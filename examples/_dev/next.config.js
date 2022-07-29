/** @type {import('next').NextConfig} */
const withPreconstruct = require('@preconstruct/next')

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = withPreconstruct(nextConfig)
