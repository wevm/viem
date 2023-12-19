import { createRequire } from 'module'
import { defineConfig } from 'vitepress'

import { sidebar } from './sidebar'

const require = createRequire(import.meta.url)
const pkg = require('../../src/package.json')

const title = 'viem'
const description =
  'Build reliable Ethereum apps & libraries with lightweight, composable, & type-safe modules from viem.'

export default defineConfig({
  lang: 'en-US',

  title: title,
  titleTemplate: `:title · ${title}`,
  description,

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/favicons/light.png' }],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        href: '/favicons/dark.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    [
      'meta',
      {
        property: 'og:title',
        content: `${title} · TypeScript Interface for Ethereum`,
      },
    ],
    ['meta', { property: 'og:image', content: 'https://viem.sh/og-image.png' }],
    ['meta', { property: 'og:url', content: 'https://viem.sh' }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@wagmi_sh' }],
    ['meta', { name: 'theme-color', content: '#1E1E20' }],
    [
      'script',
      {
        src: 'https://cdn.usefathom.com/script.js',
        'data-site': 'BYCJMNBD',
        defer: '',
      },
    ],
  ],

  themeConfig: {
    algolia: {
      appId: 'B2GGTJJMD3',
      apiKey: '42f4bd06fd3343c9a742128af056bdf5',
      indexName: 'viem',
    },

    editLink: {
      pattern: 'https://github.com/wevm/viem/edit/main/site/:path',
      text: 'Edit this page on GitHub',
    },

    externalLinkIcon: true,

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present weth, LLC',
    },

    logo: { light: '/icon-light.png', dark: '/icon-dark.png' },

    nav: [
      { text: 'Docs', link: '/docs/getting-started', activeMatch: '/docs' },
      {
        text: 'Examples',
        link: 'https://github.com/wevm/viem/tree/main/examples',
      },
      {
        text: pkg.version,
        items: [
          {
            text: `Migrating to ${toPatchVersionRange(pkg.version)}`,
            link: `/docs/migration-guide.html#_${toPatchVersionRange(
              pkg.version,
            ).replace(/\./g, '-')}-breaking-changes`,
          },
          {
            text: 'Changelog',
            link: 'https://github.com/wevm/viem/blob/main/src/CHANGELOG.md',
          },
          {
            text: 'Contributing',
            link: 'https://github.com/wevm/viem/blob/main/.github/CONTRIBUTING.md',
          },
        ],
      },
    ],

    outline: [2, 3],

    sidebar,

    siteTitle: false,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/wevm/viem' },
    ],
  },

  vite: {
    server: {
      fs: {
        allow: ['../..'],
      },
    },
  },
})

function toPatchVersionRange(version: string) {
  const [major, minor] = version.split('.').slice(0, 2)
  return `${major}.${minor}.x`
}
