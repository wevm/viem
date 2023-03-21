import type { HDKey } from '@scure/bip32'

import { toHex } from '../utils'
import { privateKeyToAccount } from './privateKeyToAccount'
import type { HDAccount, HDOptions } from './types'

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
