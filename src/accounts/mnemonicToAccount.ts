import { HDKey } from '@scure/bip32'
import { mnemonicToSeedSync } from '@scure/bip39'

import { hdKeyToAccount } from './hdKeyToAccount.js'
import type { HDAccount, HDOptions } from './types.js'

/**
 * @description Creates an Account from a mnemonic phrase.
 *
 * @returns A HD Account.
 */
export function mnemonicToAccount(
  mnemonic: string,
  opts: HDOptions = {},
): HDAccount {
  const seed = mnemonicToSeedSync(mnemonic)
  return hdKeyToAccount(HDKey.fromMasterSeed(seed), opts)
}
