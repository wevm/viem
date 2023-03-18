import { InvalidAddressError } from '../errors'
import type { Address } from '../types'
import type { Account, LocalAccount } from '../types/account'
import { isAddress } from './address'

export function getAccount(
  account: Address | Omit<LocalAccount, 'type'>,
): Account {
  if (typeof account === 'string') {
    if (!isAddress(account)) throw new InvalidAddressError({ address: account })
    return { address: account, type: 'json-rpc' }
  }

  if (!isAddress(account.address))
    throw new InvalidAddressError({ address: account.address })
  return {
    ...account,
    type: 'local',
  }
}
