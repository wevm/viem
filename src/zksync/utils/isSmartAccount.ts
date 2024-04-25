import type { Account } from '../../types/account.js'
import type { SmartAccount } from '../accounts/types.js'

export function isSmartAccount(account: Account): account is SmartAccount {
  return (account as SmartAccount).addressAccount !== undefined
}
