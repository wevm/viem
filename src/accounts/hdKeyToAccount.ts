import { toHex } from '../utils/encoding/toHex.js'
import { privateKeyToAccount } from './privateKeyToAccount.js'
import type { HDAccount, HDOptions } from './types.js'
import type { HDKey } from '@scure/bip32'

/**
 * @description Creates an Account from a HD Key.
 *
 * @returns A HD Account.
 */
export function hdKeyToAccount(
  hdKey_: HDKey,
  { accountIndex = 0, addressIndex = 0, changeIndex = 0, path }: HDOptions = {},
): HDAccount {
  const hdKey = hdKey_.derive(
    path || `m/44'/60'/${accountIndex}'/${changeIndex}/${addressIndex}`,
  )
  const account = privateKeyToAccount(toHex(hdKey.privateKey!))
  return {
    ...account,
    getHdKey: () => hdKey,
    source: 'hd',
  }
}
