import { type Anvil, history, local, mainnet, optimism } from './anvil.js'
import { type Bundler, bundler, bundler09 } from './bundler.js'

type Instances = {
  anvils: readonly Anvil[]
  bundlers: readonly Bundler[]
}

export const instances: Instances = {
  anvils: [mainnet, local, history, optimism],
  bundlers: [bundler, bundler09],
} as const
