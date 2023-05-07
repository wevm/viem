import type { Address } from 'abitype'

import type { Account } from '../types.js'

export function parseAccount(account: Address | Account): Account {
  if (typeof account === 'string') return { address: account, type: 'json-rpc' }
  return account
}
