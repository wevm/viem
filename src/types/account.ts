import type { Address } from 'abitype'

import type { Account, JsonRpcAccount } from '../accounts/types.js'

import type { IsUndefined, Prettify } from './utils.js'

export type GetAccountParameter<
  TAccount extends Account | undefined = Account | undefined,
> = IsUndefined<TAccount> extends true
  ? { account: Account | Address }
  : { account?: Account | Address }

export type ParseAccount<
  TAccountOrAddress extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
> = TAccountOrAddress extends Address
  ? Prettify<JsonRpcAccount<TAccountOrAddress>>
  : TAccountOrAddress

export type {
  Account,
  AccountSource,
  CustomSource,
  HDAccount,
  HDOptions,
  JsonRpcAccount,
  LocalAccount,
  PrivateKeyAccount,
} from '../accounts/types.js'
export type { HDKey } from '@scure/bip32'
