import type { Account } from '../accounts/types.js'
import type { JsonRpcAccount } from '../accounts/types.js'
import type { IsUndefined } from './utils.js'
import type { Address } from 'abitype'
export type GetAccountParameter<
  TAccount extends Account | undefined = Account | undefined,
> = IsUndefined<TAccount> extends true
  ? { account: Account | Address }
  : { account?: Account | Address }

export type ParseAccount<TAccount extends Account | Address | undefined> =
  | (TAccount extends Account ? TAccount : never)
  | (TAccount extends Address ? JsonRpcAccount : never)
  | (TAccount extends undefined ? undefined : never)

export type { Account } from '../accounts/types.js'
export type { AccountSource } from '../accounts/types.js'
export type { CustomSource } from '../accounts/types.js'
export type { HDAccount } from '../accounts/types.js'
export type { HDKey } from '@scure/bip32'
export type { HDOptions } from '../accounts/types.js'
export type { JsonRpcAccount } from '../accounts/types.js'
export type { LocalAccount } from '../accounts/types.js'
export type { PrivateKeyAccount } from '../accounts/types.js'
