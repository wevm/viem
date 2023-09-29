import type { Address } from 'abitype'

import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../types.js'

export type ParseAccountErrorType = ErrorType

export function parseAccount(account: Address | Account): Account {
  if (typeof account === 'string') return { address: account, type: 'json-rpc' }
  return account
}
