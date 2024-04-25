import type { Address } from 'abitype'
import type { LocalAccount } from '../../types/account.js'
import type { Hash } from '../../types/misc.js'

export type SmartAccount = LocalAccount<'smartAccount'> & {
  addressAccount: Address
}

export type SmartAccountAddressesParams = {
  address: Address
  addressAccount?: Address
}

export type SmartAccountParams<
  TSignPayloadType extends Object = Hash,
  TSignReturnType extends Object = Hash,
> = SmartAccountAddressesParams & {
  sign: (payload: TSignPayloadType) => Promise<TSignReturnType>
}
