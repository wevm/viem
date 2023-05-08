import { fromHere } from './utils'
import { join } from 'node:path'

const root = fromHere('..', '..', '..')
const dev = join(root, 'dev')
const configs = join(dev, 'configs')
const srcRoot = join(root, 'src')
const outRoot = join(root, 'dist')

export const repoDirs = {
  root,
  dev,
  configs,
  srcRoot,
  outRoot,
}
