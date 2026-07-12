---
"viem": major
---

The `viem/tempo/chains` entrypoint moved to the `Chain` namespace on `viem/tempo`.

```diff
- import { tempoMainnet } from 'viem/tempo/chains'
+ import { Chain } from 'viem/tempo'

- const chain = tempoMainnet
+ const chain = Chain.tempoMainnet
```

The `tempoTestnet` chain moved with the entrypoint and remained an alias of Tempo Moderato.

```diff
- import { tempoTestnet } from 'viem/tempo/chains'
+ import { Chain } from 'viem/tempo'

- const chain = tempoTestnet
+ const chain = Chain.tempoTestnet
```

The Zone HTTP transport config moved from `ZoneHttpConfig` to `http.Options`.

```diff
- import { http, type ZoneHttpConfig } from 'viem/tempo/zones'
+ import { http } from 'viem/tempo/zones'

- const options: ZoneHttpConfig = { retryCount: 1 }
+ const options: http.Options = { retryCount: 1 }
```

Updated Zone deposits for current portals and added dynamic addresses, bounceback recipients, encryption-key reads, and deposit-status waiting.

```diff
 await Actions.zone.deposit(client, {
   amount,
+  bouncebackRecipient,
+  portalAddress,
   token,
   zoneId,
 })

+const key = await Actions.zone.getEncryptionKey(client, { portalAddress, zoneId })
+const status = await Actions.zone.waitForDepositStatus(zoneClient, { tempoBlockNumber })
```

The `viem/tempo` extension was rebuilt on v3 primitives: module namespaces (`Abis`, `Account`, `Addresses`, `Capabilities`, `Expiry`, `Hardfork`, `KeyAuthorizationManager`, `P256`, `Scopes`, `Selectors`, `Storage`, `WebAuthnP256`, `WebCryptoP256`), chain schema hooks in place of formatters/serializers, a `Client.create` factory decorated with `tempoActions()`, and domain-namespaced actions (`accessKey`, `amm`, `channel`, `dex`, `faucet`, `fee`, `nonce`, `policy`, `receivePolicy`, `token`, `validator`, `virtualAddress`, `wallet`, and `zone`). The zones surface lives at `viem/tempo/zones` (auth-token `http` transport, `zone`/`zoneModerato` chain builders).

```diff
- import { Account, Actions, createClient } from 'viem/tempo'
+ import { Account, Actions, Client } from 'viem/tempo'

- const client = createClient({ account })
+ const client = Client.create({ account })

- await Actions.token.transferSync(client, {
-   amount: parseUnits('1', 6),
-   to,
-   token: 'pathusd',
- })
+ await client.token.transferSync({
+   amount: { formatted: '1' },
+   to,
+   token: '0x20c0000000000000000000000000000000000000',
+ })
```

Breaking changes:

- Tokens are selected by address; token ids and the `TokenIds` namespace were removed (`fee.getUserToken` returns the token address).
- Watcher actions (`token.watch*`, …) return a `Watcher` handle (`watcher.onLogs(fn)` to subscribe, with decoded `log.args`) instead of accepting per-event callback options.
- `nonce.getNonce` → `nonce.get`; `nonce.watchNonceIncremented` → `nonce.watchIncremented`.
- `policy.create` now honors an explicit `admin` option (previously the sender was always used).
- The `reward` actions were removed (reward distribution is hardfork-disabled on-chain).
- The `simulate` namespace dissolved into core: use `client.block.simulate` or `client.contract.simulate`.
- `withFeePayer` and `walletNamespaceCompat` transports were removed; `withRelay` remains and gained a `policy` option (`'sign-only'` co-signs via the relay and broadcasts through the default transport; `'sign-and-broadcast'` forwards the submission to the relay).
- `Account_base` → `Account.Base`; `Account.signAuthorization` takes the ox `Authorization` shape; `accessKeyAddress`/`resolveAccessKey` return checksummed addresses; the deprecated `z_*` re-exports and `internal_version` option were removed.
- `TempoAddress` was removed in favor of checksummed `Address.Address` values.

The `withRelay.type` constant was removed; relay transports retained the `'relay'` type discriminant.

```diff
 const transport = withRelay(defaultTransport, relayTransport)
-transport.type === withRelay.type
+transport.type === 'relay'
```
