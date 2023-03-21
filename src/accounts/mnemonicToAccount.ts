import { mnemonicToSeedSync } from '@scure/bip39'

import { masterSeedToAccount } from './masterSeedToAccount'
import type { HDOptions, LocalAccount } from './types'

type HDAccount = LocalAccount<'hd'>

export function mnemonicToAccount(
  mnemonic: string,
  opts: HDOptions = {},
): HDAccount {
  const seed = mnemonicToSeedSync(mnemonic)
  return masterSeedToAccount(seed, opts)
}
