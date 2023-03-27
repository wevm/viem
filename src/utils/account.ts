import { InvalidAddressError } from '../errors/index.js'
import type { Address } from '../types/index.js'
import type { Account, LocalAccount } from '../types/account.js'
import { isAddress } from './address/index.js'

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
