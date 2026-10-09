---
"viem": minor
---

Added the `Relay.keyAuthorization` plugin to `viem/tempo`, which saves key authorizations signed with `Actions.accessKey.signAuthorization` (including multisig authorizations at quorum) and attaches them to the access key's next transaction, and deprecated `KeyAuthorizationManager` and the `keyAuthorizationManager` account option in its favor.

```diff
- const accessKey = Account.fromP256(privateKey, {
-   access: root,
-   keyAuthorizationManager: KeyAuthorizationManager.memory(),
- })
+ const accessKey = Account.fromP256(privateKey, { access: root })
  const client = createClient({
-   transport: http(),
+   transport: withRelay(http(), {
+     plugins: [Relay.keyAuthorization({ store: Store.memory() })],
+   }),
  })
```
