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

Chain formatter configuration was replaced by RPC/native schema codecs. `fromRpc` codecs decode wire values via `z.decode`; `toRpc` codecs encode native values via `z.encode` (the codec's native side is its output — request option types resolve from `z.output` of `schema.transactionRequest.toRpc`).

```diff
-import { defineChain, formatters } from 'viem'
+import { Chain } from 'viem'
+import * as z from 'zod/mini'
 
-const chain = defineChain({
-  formatters: {
-    block: formatters.defineBlock({ format(args) { return args } }),
-  },
+const chain = Chain.from({
+  schema: {
+    block: {
+      fromRpc: z.object({ baseFeePerGas: z.bigint() }),
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
