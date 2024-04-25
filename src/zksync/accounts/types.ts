import type { Address } from 'abitype'
import type { LocalAccount } from '../../types/account.js'
import type { Hash } from '../../types/misc.js'

export type SmartAccount = LocalAccount<'smartAccount'> & {
  addressAccount: Address
}

export type SmartAccountParams<TSignReturnType extends Object = Hash> = {
  address: Address
  addressAccount?: Address
  sign: (payload: Hash) => Promise<TSignReturnType>
}
