import { HDKey } from '@scure/bip32'
import { mnemonicToSeedSync } from '@scure/bip39'

import type { ErrorType } from '../errors/utils.js'
import {
  type HDKeyToAccountErrorType,
  hdKeyToAccount,
} from './hdKeyToAccount.js'
import type { HDAccount, HDOptions } from './types.js'

export type MnemonicToAccountErrorType = HDKeyToAccountErrorType | ErrorType

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
