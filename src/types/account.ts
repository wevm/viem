import type { Address } from 'abitype'

import type { Account, JsonRpcAccount } from '../accounts/types.js'

import type { IsUndefined } from './utils.js'

export type GetAccountParameter<
  TAccount extends Account | undefined = Account | undefined,
> = IsUndefined<TAccount> extends true
  ? { account: Account | Address }
  : { account?: Account | Address }

export type ParseAccount<TAccount extends Account | Address | undefined> =
  | (TAccount extends Account ? TAccount : never)
  | (TAccount extends Address ? JsonRpcAccount : never)
  | (TAccount extends undefined ? undefined : never)

export {
  type Account,
  type AccountSource,
  type CustomSource,
  type HDAccount,
  type HDOptions,
  type JsonRpcAccount,
  type LocalAccount,
  type PrivateKeyAccount,
} from '../accounts/types.js'
export type { HDKey } from '@scure/bip32'
