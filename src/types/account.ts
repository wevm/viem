import type { Address } from 'abitype'

import type { Account, JsonRpcAccount } from '../accounts/types.js'

import type { IsUndefined, Prettify } from './utils.js'

export type DeriveAccount<
  account extends Account | undefined,
  accountOverride extends Account | Address | undefined,
> = accountOverride extends Account | Address ? accountOverride : account

export type GetAccountParameter<
  TAccount extends Account | undefined = Account | undefined,
  TAccountOverride extends Account | Address | undefined = Account | Address,
  TRequired extends boolean = true,
> = IsUndefined<TAccount> extends true
  ? TRequired extends true
    ? { account: TAccountOverride | Account | Address }
    : { account?: TAccountOverride | Account | Address | undefined }
  : { account?: TAccountOverride | Account | Address | undefined }

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
