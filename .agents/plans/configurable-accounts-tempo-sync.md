# Plan: sync viem configurable accounts with Tempo main

Status: in progress · Owner: jxom · Last reviewed: 2026-10-22

Bring `viem/tempo` configurable-account support up to date with Tempo main and
the current TIP cluster, and add TIP-1113 in-place migration actions.

**Depends on the ox plan** (`ox/.agents/plans/configurable-accounts-tempo-sync.md`).
viem pins `ox@0.14.56` (`package.json:74`, `src/package.json:233`,
`pnpm-workspace.yaml:56`). Every hashing path here goes through ox
`AccountConfig`, so Phase 0 is bumping to the `0.x` release that carries the
fixed domains and migration helpers.

## Sources of truth

| Source | What it settles |
| --- | --- |
| [tempoxyz/tempo#7510](https://github.com/tempoxyz/tempo/pull/7510) (TIP-1107–1114) | Spec |
| Tempo main `20c4412` ([#8502](https://github.com/tempoxyz/tempo/pull/8502), [#8497](https://github.com/tempoxyz/tempo/pull/8497)) | Renamed ABI, domains and genesis key |
| `crates/contracts/src/precompiles/configurable_account.rs` | `IConfigurableAccount` (events, errors, `upgradeAccount`) |
| `crates/chainspec/src/spec.rs:53` | Genesis key `configurableAccountRecoveryFactory` |
| [tempoxyz/tempo#8204](https://github.com/tempoxyz/tempo/pull/8204) (TIP-1137) | Admin access keys removed at T14 |
| Open impl PRs [#7579](https://github.com/tempoxyz/tempo/pull/7579), [#7581](https://github.com/tempoxyz/tempo/pull/7581), [#8183](https://github.com/tempoxyz/tempo/pull/8183), [#8486](https://github.com/tempoxyz/tempo/pull/8486) | RPC wire names and migration behavior. These still use "multisig" naming. |

## Current state

- viem was last synced in `0872b53` (#5216). That predates Tempo's renames
  (Oct 20).
- These already match main: the precompile address `0xAACC…`, the function
  selectors (`deriveAccount` `0xce8e071c`, `getConfigCommitment` `0x5bd93359`,
  `updateConfig` `0x64203645`), the event field layout, the limits,
  primitive-only owners, and relay commitment revalidation.

## Phase 0: bump ox

- Bump `ox` to the `0.x` release from the ox plan (expected `0.14.57`) in
  `package.json`, `src/package.json` and `pnpm-workspace.yaml`.
- Refresh every configurable-account snapshot (addresses, commitments,
  digests) in `accounts/*.test.ts`, `Account.test.ts`, `chainConfig.accounts.test.ts`
  and `internal/relay/*.accounts.test.ts`.
- Add a changeset noting that configurable-account addresses and signatures
  change.

## Phase 1: precompile ABI, addresses and selectors (breaking)

`Abis.nativeMultisig` (`src/tempo/Abis.ts:447-534`, plus the copy spliced into
`coreErrors` at about :9962) uses the pre-#8502 names, so their identifiers
are wrong:

| viem | main | Identifier change |
| --- | --- | --- |
| `MultisigConfigUpdated` | `ConfigurableAccountConfigUpdated` | topic `0x319e312d…` → `0x30a5bc75…` |
| `InvalidMultisigOwner` | `InvalidConfigurableAccountOwner` | `0xf78f4295` → `0xfeb0f564` |
| `UnauthorizedMultisigCaller` | `UnauthorizedConfigurableAccountCaller` | `0x9c53cafc` → `0xe90dc344` |

The ABI is also missing `upgradeAccount(uint8,(address,uint8)[])` (`0x5f5fdc31`),
the `AccountUpgraded` event, and the errors `InvalidAccount`,
`PrimitiveRootRequired`, `UpgradeMustBeOnlyCall`, `AccountAlreadyConfigurable`
and `AccountHasCode`.

Tasks:
- `scripts/generateTempoAbis.ts:184-201`: delete the hard-coded
  `INativeMultisig` compatibility block (the "TODO: Remove once native multisig
  is merged into Tempo main" one). Main now has `IConfigurableAccount`, and a
  rerun with the block in place would emit both ABIs.
- Regenerate `Abis.ts` from Tempo main `20c4412` or later. That produces
  `Abis.configurableAccount`.
- Rename `Addresses.nativeMultisig` to `Addresses.configurableAccount`
  (`Addresses.ts:18`) and `Selectors.nativeMultisig` to
  `Selectors.configurableAccount` (`Selectors.ts:52`). Keep the old names as
  `@deprecated` aliases for one release.
- `ExecutionError.ts:117,222`: key error decoding and hints on the new error
  names, add hints for the five migration errors, and fix the "multisig
  caller" message.
- `actions/accounts.ts:362-372`: point `updateConfig.extractEvent` at
  `ConfigurableAccountConfigUpdated`. Today `updateConfigSync` throws after a
  successful update.
- Regenerate `Abis.test.ts` and `Selectors.test.ts` snapshots.

## Phase 2: test infrastructure

- `test/src/tempo/prool.ts:116`: rename `genesis.config.multisigRecoveryFactory`
  to `configurableAccountRecoveryFactory`. Today the factory is silently unset
  on current images.
- Set `t14Time` in the test genesis and move the node image to a T14
  integration build with the new domains.

**Blocked (same as ox Phase 5):** main does not validate configurable-account
transactions yet, and the integration branches #7581 and #7894 still use the
old domains. Keep `e2e.accounts.test.ts` gated until one of them rebases onto
#8502.

## Phase 3: hardforks and TIP-1137 admin keys

- `src/tempo/Hardfork.ts:1-13`: the list ends at `t6`. Add `t7`…`t14`. Make
  `lt` handle unknown names instead of returning `-1`: today
  `lt('t14', 't3') === true`, which sends T14 chains down the pre-T3 path at
  `actions/accessKey.ts:635`.
- Admin keys from configurable accounts. `accessKey.signAuthorization` passes
  `isAdmin: true` (`accessKey.ts:1339`), as do `Account.signKeyAuthorization`
  and `getKeyAuthorizationSignPayload` (`Account.ts:797-869, 1048-1071`).
  Configurable accounts exist only from T14, where TIP-1137 makes admin
  grants invalid. Reject `admin` for configurable accounts, and default to
  non-admin on T14 chains.
- Add T14 notes to `accessKey.authorize({ admin })`, `isAdmin`,
  `watchAdminAuthorized` and `verifyHash` (whose default `admin: true` uses
  `verifyKeychainAdmin`, `accessKey.ts:1948-2027`).

## Phase 4: TIP-1113 migration actions (new API)

Flow: the root key signs an ordinary `0x76` transaction whose only call is
`upgradeAccount(threshold, owners)`. There is no extra approval domain. The
new config is `AccountConfig.fromUpgrade(root, { owners, threshold })`, from
ox Phase 2. After success, the root key can never sign on its own again.

Tasks in `actions/accounts.ts`, following the `updateConfig` shape:
- Add `accounts.upgrade`, `accounts.upgradeSync`, `accounts.upgrade.call({ owners, threshold })`
  and `accounts.upgrade.extractEvent(logs)` (which reads `AccountUpgraded`).
  - Throw when the account is configurable or an access key. A root signer
    is required.
  - Force `calls: [upgrade.call(...)]`. Throw if the caller passes other
    calls, `keyAuthorization` or `authorizationList`. Allow `feePayer`.
  - `upgradeSync` returns `{ account, commitment, config, receipt }`, matching
    `updateConfigSync`.
- Add `accounts.prepareUpgrade({ account, owners, threshold })`.
  - Checks eligibility: `getCode` is empty and `getConfigCommitment` is zero.
  - Returns `{ config, commitment }`, and optionally simulates via
    `eth_call`, which returns the commitment.
- Accept the upgrade form in `Account.fromConfig` (`Account.ts:470`
  `CurrentConfig`), for example `{ address: root, upgrade: { owners, threshold } }`,
  so the migrated account can sign `0x05` envelopes without the caller
  computing the salt.
- `internal/relay/accounts.ts:796-840` (`cacheNextConfigs`): also learn
  configs from `upgradeAccount` calls and `AccountUpgraded` logs.
- Errors: the node rejects malformed migration transactions before execution
  (`-32000 migration must be the sole call without authorizations`) as well
  as with contract reverts. Surface both through `ExecutionError`.
- Docs: add a `guides/configurable-accounts/migrate.mdx`. It must state that
  retiring the root key is permanent, and warn that incoming access-key
  grants, permits and channel vouchers signed by the root stop working
  (TIP-1113 §Tooling).

## Phase 5: configurable accounts as access keys (TIP-1111)

ox already supports these. viem does not.
- `Account.ts:1114-1150` (`resolveAccessKey`): add a configurable key type, so
  viem can authorize a configurable account as an access key and sign as one
  (a V2 keychain envelope with an inner `0x05`).
- `accessKey.getMetadata` (`accessKey.ts:71-75,538`): map signature type
  `3 → 'configurable'` instead of falling back to `secp256k1`.
- `internal/relay/feePayer.ts:646-662,806`: accept keychain envelopes with
  configurable inner signatures. Today they fail with "Transaction signature
  is invalid."

## Phase 6: smaller API gaps and naming

- Add an `accounts.deriveAccount` action wrapping the precompile.
- Add `verifyConfigurableAccount` to the SignatureVerifier ABI and actions
  once the name settles (the open PRs call it `verifyMultisig`).
- Replace the global `Addresses.nativeMultisigFactory = 0x7171…` (labelled
  temporary) with a per-chain setting in `chainConfig`. On main the factory
  comes from genesis and is unset on public networks.
- Store keys use `multisig:config:`, `multisig:operation:` and
  `multisig:submission:` (`accounts/Config.ts:109`, `accounts/Operation.ts:176,181`).
  Rename them to `configurableAccount:*` and read the old keys as a fallback
  for one release.
- Docs: `guides/configurable-accounts/rotate-owners.mdx:164` and
  `accounts/account.fromConfig.mdx:73` reference `MultisigConfigUpdated`.
  `accessKey.authorize.mdx:209-249,343-347` and `accessKey.signAuthorization.mdx:277-281`
  need T14 admin-key notes.

## Phase 7: deferred until the Tempo PRs rebase

- **RPC wire names:** `'multisig'` key type and `multisigSimulation`
  (`Transaction.ts:106-107`, `internal/relay/feePayer.ts:177,240`). Follow
  ox Phase 6.
- **Account proxy hash:** the init-code hash will change when TIP-1110 is
  final. Rerun Phase 0's snapshot refresh after the ox release that carries
  it.
- **Recovery and pinning tooling:** cross-chain recovery and pin tooling
  (TIP-1110) waits until the canonical values are decided.

## Ordering and verification

1. Phase 0 and Phase 1 in one PR. It is breaking and must land together, or
   events and errors stay broken.
2. Phase 3, then Phase 4. Migration depends on the T14 hardfork entry.
3. Phases 5 and 6 as follow-ups.

Per PR:
- `pnpm check:types`
- `pnpm test --run src/tempo`
- `pnpm test:typecheck`
- a changeset, written as one sentence in past tense

## Open questions

- Activation: T14 (#7510), or a separate `accountMigrationTime` (#8183)? Do not
  hard-code availability. Let the node reject and decode
  `MigrationNotActive` if it ships.
- Wire names: confirm the final names with joshieDo before Phase 7.
- How long to keep the `nativeMultisig` aliases and old store-key fallbacks.

## Progress (2026-10-22)

Synced against tempoxyz/tempo `joshie/configurable-t14-devnet-checkpoint` (`e539a1d`),
matching ox. ox is pinned to the 0.x prerelease `https://pkg.pr.new/ox@e9b66c2` until
`0.14.57` is published.

Done:
- Phase 0: ox prerelease bump and snapshot refresh for the new domains.
- Phase 1: `Abis`, `Addresses` and `Selectors` renamed to `configurableAccount` without
  aliases (the API is experimental, following #5216). `Addresses.nativeMultisigFactory`
  is now `configurableAccountRecoveryFactory`. ABIs regenerated with
  `TEMPO_REF=joshie/configurable-t14-devnet-checkpoint`, which also adds
  `verifyConfigurableAccount` and `RootKeyRetired`. The compatibility block is removed.
  Execution error messages and hints cover the migration errors.
- Phase 2: genesis key `configurableAccountRecoveryFactory`, `t14Time: 0`, CI image
  `sha-04e67d3`.
- Phase 3: hardforks `t7`…`t14`; `Hardfork.lt` treats unknown names as newer. Admin
  key rejection is dropped: the checkpoint node allows configurable admin keys.
- Phase 4: `accounts.upgrade`, `accounts.upgradeSync`, `upgrade.call`,
  `upgrade.extractEvent`, `Account.fromConfig({ address, upgrade })`, relay caching of
  root-signed upgrades, action docs and an upgrade guide. `prepareUpgrade` was skipped:
  `AccountConfig.fromUpgrade` covers the config, and the node rejects ineligible accounts.
- Phase 5: `accessKey.getMetadata` maps signature type `3` to `configurable`.
- Phase 7: wire field `configurableAccountSimulation`.
- Phase 6: store keys renamed to `configurableAccount:{config,operation,submission}:*`.
  Old keys are not read: the new domains change every commitment and operation hash,
  so old entries could not match anyway.

Not done:
- Zone ABIs: Tempo main moved `IZonePortal` and `IZoneVerifier` to
  `crates/contracts/src/zones/`, and `IZoneFactory` changed. The generator only reads
  `precompiles/`, so the Zone exports were kept at their previous generated values.
- Phase 5: signing as a configurable access key (`resolveAccessKey`) and relay fee payer
  support for keychain envelopes with configurable inner signatures.
- Phase 6: none. `accounts.deriveAccount` and `accounts.verifyHash` wrap the precompiles,
  and Tempo `verifyHash` verifies configurable signatures. The recovery factory stays a
  default shared by all chains, with a `factory` override on `Account.fromConfig`; the
  relay and config store use the default.
