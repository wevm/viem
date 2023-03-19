import type { Address } from 'abitype'
import type { Account, JsonRpcAccount } from '../accounts'

export type GetAccountParameter<
  TAccount extends Account | undefined = undefined,
> = TAccount extends undefined
  ? { account: Account | Address }
  : { account?: Account | Address }

export type ParseAccount<TAccount extends Account | Address | undefined> =
  | (TAccount extends Account ? TAccount : never)
  | (TAccount extends Address ? JsonRpcAccount : never)
  | (TAccount extends undefined ? undefined : never)
