---
"viem": major
---

Chain definitions were moved from `defineChain` to the `Chain` namespace.

```diff
-import { defineChain } from 'viem'
+import { Chain } from 'viem'
 
-export const example = defineChain({
+export const example = Chain.from({
   id: 123,
   name: 'Example',
   nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
   rpcUrls: { default: { http: ['https://example.com'] } },
 })
```

Chain formatter configuration was replaced by RPC/native schema converters. `fromRpc` converters decode wire values to native shapes; `toRpc` converters encode native values to wire shapes (request option types resolve from the parameter type of `schema.transactionRequest.toRpc`).

```diff
-import { defineChain, formatters } from 'viem'
+import { Chain } from 'viem'
+import { Block } from 'ox'
 
-const chain = defineChain({
-  formatters: {
-    block: formatters.defineBlock({ format(args) { return args } }),
-  },
+const chain = Chain.from({
+  schema: {
+    block: {
+      fromRpc: (rpc) => Block.fromRpc(rpc),
+    },
+  },
 })
```

Deprecated chain fee fields were removed in favor of `maxPriorityFeePerGas`.

```diff
-const chain = defineChain({
+const chain = Chain.from({
   fees: {
-    defaultPriorityFee: 1_000_000_000n,
+    maxPriorityFeePerGas: 1_000_000_000n,
   },
 })
```

Experimental and deprecated extension chain fields were renamed or removed from the chain shape; `extendSchema` moved onto the `Chain` namespace.

```diff
-const chain = defineChain({
-  experimental_preconfirmationTime: 1_000,
-  custom: { slug: 'example' },
-  extendSchema: extendSchema<{ slug: string }>(),
+const chain = Chain.from({
+  preconfirmationTime: 1_000,
+  extendSchema: Chain.extendSchema<{ slug: string }>(),
+  slug: 'example',
 })
```

Chain transaction hooks (`toEnvelope`/`getSignPayload`/`serialize`) accept custom envelope types without casts, and the `verifyHash` hook receives the caller's `mode` and block context.

`filterChains` moved to `Chain.filter`, preserving token-support and testnet narrowing.

```diff
- import { filterChains } from 'viem'
+ import { Chain } from 'viem'

- const supported = filterChains({ chains, token: usdc })
+ const supported = Chain.filter({ chains, token: usdc })
```

Added Defi Oracle Meta Mainnet and Robinhood mainnet and testnet chain definitions.

```diff
+ import {
+   defiOracleMetaMainnet,
+   robinhood,
+   robinhoodTestnet,
+ } from 'viem/chains'
```

Removed chain definitions that were not retained for v3; applications can define them locally with `Chain.from`.

```diff
- import { optimismGoerli, shibarium, shiden, ubiq, zhejiang } from 'viem/chains'
+ import { Chain } from 'viem'

+ const chain = Chain.from({ id, name, nativeCurrency, rpcUrls })
```
