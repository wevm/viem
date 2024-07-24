import type { IsUndefined } from '../../types/utils.js'
import type { SmartAccount } from '../accounts/types.js'

export type DeriveSmartAccount<
  account extends SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined,
> = accountOverride extends SmartAccount ? accountOverride : account

export type GetSmartAccountParameter<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount,
  required extends boolean = true,
> = IsUndefined<account> extends true
  ? required extends true
    ? {
        account: IsUndefined<accountOverride> extends true
          ? SmartAccount
          : accountOverride | SmartAccount
      }
    : { account?: accountOverride | SmartAccount | undefined }
  : { account?: accountOverride | SmartAccount | undefined }
