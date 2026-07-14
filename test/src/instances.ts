import { history, local, mainnet } from './anvil.js'
import { bundler, bundler09 } from './bundler.js'

export const instances = {
  anvils: [mainnet, local, history],
  bundlers: [bundler, bundler09],
} as const
