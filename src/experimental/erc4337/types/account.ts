import type { IsUndefined } from '../../../types/utils.js'
import type { SmartAccount } from '../accounts/types.js'

export type DeriveSmartAccount<
  account extends SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined,
> = accountOverride extends SmartAccount ? accountOverride : account

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
