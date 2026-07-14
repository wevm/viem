import { history, local, mainnet, optimism } from './anvil.js'
import { bundler, bundler09 } from './bundler.js'

export const instances = {
  anvils: [mainnet, local, history, optimism],
  bundlers: [bundler, bundler09],
} as const
