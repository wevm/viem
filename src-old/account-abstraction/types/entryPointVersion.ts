import type { SmartAccount } from '../accounts/types.js'

/** @link https://github.com/eth-infinitism/account-abstraction/releases */
export type EntryPointVersion = '0.6' | '0.7' | '0.8' | '0.9'

export type DeriveEntryPointVersion<account extends SmartAccount | undefined> =
  account extends SmartAccount
    ? account['entryPoint']['version']
    : EntryPointVersion

/** @internal */
export type GetEntryPointVersionParameter<
  version extends EntryPointVersion | undefined,
  versionOverride extends EntryPointVersion | undefined =
    | EntryPointVersion
    | undefined,
> = {
  entryPointVersion?:
    | version
    | versionOverride
    | EntryPointVersion
    | null
    | undefined
}
