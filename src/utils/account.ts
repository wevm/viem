import { InvalidAddressError } from '../errors'
import type { Address } from '../types'
import type { Account, JsonRpcAccount, LocalAccount } from '../types/account'
import { isAddress } from './address'

type Source = Address | Omit<LocalAccount, 'type'>

type GetAccountReturnType<TSource extends Source> =
  | (TSource extends Address ? JsonRpcAccount : never)
  | (TSource extends Omit<LocalAccount, 'type'> ? LocalAccount : never)

export function getAccount<TSource extends Source>(
  source: TSource,
): GetAccountReturnType<TSource> {
  if (typeof source === 'string') {
    if (!isAddress(source)) throw new InvalidAddressError({ address: source })
    return {
      address: source,
      type: 'json-rpc',
    } as GetAccountReturnType<TSource>
  }

  if (!isAddress(source.address))
    throw new InvalidAddressError({ address: source.address })
  return {
    address: source.address,
    signMessage: source.signMessage,
    signTransaction: source.signTransaction,
    signTypedData: source.signTypedData,
    type: 'local',
  } as GetAccountReturnType<TSource>
}

export function parseAccount(account: Address | Account): Account {
  if (typeof account === 'string') return { address: account, type: 'json-rpc' }
  return account
}
