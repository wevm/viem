---
"viem": major
---

The `viem/tempo` extension was rebuilt on v3 primitives: module namespaces (`Abis`, `Account`, `Addresses`, `Capabilities`, `Expiry`, `Hardfork`, `KeyAuthorizationManager`, `P256`, `Scopes`, `Selectors`, `Storage`, `TokenIds`, `WebAuthnP256`, `WebCryptoP256`), chain schema hooks in place of formatters/serializers, a `Client.create` factory decorated with `tempoActions()`, and domain-namespaced actions (`token`, `fee`, `nonce`, `amm`, `channel`, and `dex` landed; further namespaces follow). The `nonce` actions drop the namespace echo: `nonce.getNonce` → `nonce.get`, `nonce.watchNonceIncremented` → `nonce.watchIncremented`.

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

Watcher actions (`token.watch*`) now return a `Watcher` handle (`watcher.onLogs(fn)` to subscribe, with decoded `log.args`) instead of accepting per-event callback options.
