import { HDKey } from '@scure/bip32'
import { mnemonicToSeedSync } from '@scure/bip39'

import type { ErrorType } from '../errors/utils.js'
import {
  type HDKeyToAccountErrorType,
  type HDKeyToAccountOptions,
  hdKeyToAccount,
} from './hdKeyToAccount.js'
import type { HDAccount } from './types.js'

export type MnemonicToAccountOptions = HDKeyToAccountOptions

export type MnemonicToAccountErrorType = HDKeyToAccountErrorType | ErrorType

/**
 * @description Creates an Account from a mnemonic phrase.
 *
 * @returns A HD Account.
 */
export function mnemonicToAccount(
  mnemonic: string,
  opts: MnemonicToAccountOptions = {},
): HDAccount {
  const seed = mnemonicToSeedSync(mnemonic)
  return hdKeyToAccount(HDKey.fromMasterSeed(seed), opts)
}
