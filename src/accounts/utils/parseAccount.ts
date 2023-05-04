import type { Account } from '../types.js'
import type { Address } from 'abitype'

export function parseAccount(account: Address | Account): Account {
  if (typeof account === 'string') return { address: account, type: 'json-rpc' }
  return account
}
