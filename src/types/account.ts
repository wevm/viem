import type { Address } from 'abitype'

import type {
  Account,
  JsonRpcAccount,
  SmartAccount,
} from '../accounts/types.js'
import type { IsUndefined, Prettify } from './utils.js'

export type DeriveAccount<
  account extends Account | undefined,
  accountOverride extends Account | Address | undefined,
> = accountOverride extends Account | Address ? accountOverride : account

export type DeriveSmartAccount<
  account extends SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined,
> = accountOverride extends SmartAccount ? accountOverride : account

export type GetAccountParameter<
  account extends Account | undefined = Account | undefined,
  accountOverride extends Account | Address | undefined = Account | Address,
  required extends boolean = true,
> = IsUndefined<account> extends true
  ? required extends true
    ? { account: accountOverride | Account | Address }
    : { account?: accountOverride | Account | Address | undefined }
  : { account?: accountOverride | Account | Address | undefined }

export type GetSmartAccountParameter<
  TAccount extends SmartAccount | undefined = SmartAccount | undefined,
  TAccountOverride extends SmartAccount | undefined = SmartAccount,
  TRequired extends boolean = true,
> = IsUndefined<TAccount> extends true
  ? TRequired extends true
    ? {
        account: IsUndefined<TAccountOverride> extends true
          ? SmartAccount
          : TAccountOverride | SmartAccount
      }
    : { account?: TAccountOverride | SmartAccount | undefined }
  : { account?: TAccountOverride | SmartAccount | undefined }

export type ParseAccount<
  accountOrAddress extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
> = accountOrAddress extends Address
  ? Prettify<JsonRpcAccount<accountOrAddress>>
  : accountOrAddress

export type { Account } from '../accounts/types.js'
export type { HDKey } from '@scure/bip32'
