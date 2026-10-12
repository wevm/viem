---
"viem": patch
---

`viem/tempo`: Changed `KeyAuthorizationManager.from` to build the manager from a `Store` instead of a custom `get`/`set`/`remove` source.

```diff
- const keyAuthorizationManager = KeyAuthorizationManager.from({
-   source: { get, set, remove },
- })
+ const keyAuthorizationManager = KeyAuthorizationManager.from({
+   store: Store.session(),
+ })
```
