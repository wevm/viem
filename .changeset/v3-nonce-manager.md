---
"viem": major
---

Nonce manager construction moved from `createNonceManager` to `NonceManager.from`, and the `jsonRpc` source + default `nonceManager` instance moved onto the `NonceManager` namespace.

```diff
-import { createNonceManager, jsonRpc, nonceManager } from 'viem'
+import { NonceManager } from 'viem'

-const manager = createNonceManager({ source: jsonRpc() })
+const manager = NonceManager.from({ source: NonceManager.jsonRpc() })

-const defaultManager = nonceManager
+const defaultManager = NonceManager.nonceManager
```

The `viem/nonce` entrypoint was removed; import the `NonceManager` namespace from the root entrypoint instead.

```diff
-import { createNonceManager } from 'viem/nonce'
+import { NonceManager } from 'viem'
```

The `NonceManagerSource` and `CreateNonceManagerParameters` types moved into the `NonceManager` namespace as `NonceManager.Source` and `NonceManager.from.Options`.

```diff
-import type { CreateNonceManagerParameters, NonceManagerSource } from 'viem'
+import type { NonceManager } from 'viem'

-const options: CreateNonceManagerParameters = { source }
-const source: NonceManagerSource = { get, set }
+const options: NonceManager.from.Options = { source }
+const source: NonceManager.Source = { get, set }
```
