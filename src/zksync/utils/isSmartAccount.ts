import type { Account } from '../../types/account.js'
import type { SmartAccount } from '../accounts/toSmartAccount.js'

export function isSmartAccount(account: Account): account is SmartAccount {
  return (account as SmartAccount).walletAccount !== undefined
}
