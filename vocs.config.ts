import { createRequire } from 'module'
import { defineConfig } from 'vocs'
import { sidebar } from './site/sidebar'

const require = createRequire(import.meta.url)
const pkg = require('./src/package.json')

export default defineConfig({
  rootDir: 'site',
  sidebar,
  theme: {
    accentColor: 'orange',
  },
  topNav: [
    { text: 'Docs', link: '/docs/getting-started', match: '/docs' },
    {
      text: 'Extensions',
      items: [
        {
          text: 'OP Stack',
          link: '/op-stack',
        },
      ],
    },
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
  title: 'Viem',
})

function toPatchVersionRange(version: string) {
  const [major, minor] = version.split('.').slice(0, 2)
  return `${major}.${minor}.x`
}
