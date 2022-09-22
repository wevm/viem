const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  unstable_flexsearch: {
    codeblocks: true,
  },
  unstable_staticImage: true,
  unstable_defaultShowCopyCode: true,
})

const config = withNextra({
  i18n: {
    locales: ['en-US'],
    defaultLocale: 'en-US',
  },
  reactStrictMode: true,
  experimental: {
    newNextLinkBehavior: true,
    images: {
      allowFutureImage: true,
    },
  },
})

if (process.env.NODE_ENV === 'development') {
  const withPreconstruct = require('@preconstruct/next')
  module.exports = withPreconstruct(config)
} else {
  module.exports = config
}
