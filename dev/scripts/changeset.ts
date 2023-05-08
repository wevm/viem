import { repoDirs } from './utils/path'
import { fromHere, shell } from './utils/utils'

shell(
  `node ${fromHere(
    '..',
    '..',
    'node_modules',
    '@changesets',
    'cli',
    'bin.js',
  )} ${process.argv.slice(2).join(' ')}`,
  { cwd: repoDirs.dev },
)
