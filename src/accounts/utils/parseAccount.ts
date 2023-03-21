import type { Address } from '../../types'
import type { Account } from '../types'

export function parseAccount(account: Address | Account): Account {
  if (typeof account === 'string') return { address: account, type: 'json-rpc' }
  return account
}
