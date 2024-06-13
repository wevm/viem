/** @link https://github.com/eth-infinitism/account-abstraction/releases */
export type EntryPointVersion = '0.0' | '0.7'

export type DeriveEntryPointVersion<
  version extends EntryPointVersion | undefined,
  versionOverride extends EntryPointVersion | undefined,
> = versionOverride extends EntryPointVersion
  ? versionOverride
  : version extends EntryPointVersion
    ? version
    : EntryPointVersion

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
