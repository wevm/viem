import { HDKey } from '@scure/bip32'

import { toBytes, toHex } from '../utils'
import type { ByteArray, Hex } from '../types'
import { privateKeyToAccount } from './privateKeyToAccount'
import type { HDOptions, LocalAccount } from './types'

type HDAccount = LocalAccount<'hd'> & {
  getHdKey(): HDKey
}

export function masterSeedToAccount(
  seed_: Hex | ByteArray,
  { accountIndex = 0, addressIndex = 0, changeIndex = 0, path }: HDOptions = {},
): HDAccount {
  const seed = typeof seed_ === 'string' ? toBytes(seed_) : seed_
  const hdKey = HDKey.fromMasterSeed(seed).derive(
    path || `m/44'/60'/${accountIndex}'/${changeIndex}/${addressIndex}`,
  )
  const account = privateKeyToAccount(toHex(hdKey.privateKey!))
  return {
    ...account,
    getHdKey: () => hdKey,
    source: 'hd',
  }
}
