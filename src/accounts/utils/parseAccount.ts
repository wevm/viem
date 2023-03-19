import type { Address } from '../../types'
import type { Account } from '../toAccount'

export function parseAccount(account: Address | Account): Account {
  if (typeof account === 'string') return { address: account, type: 'json-rpc' }
  return account
}
