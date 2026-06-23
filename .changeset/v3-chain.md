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

Chain formatter configuration was replaced by RPC/native schema codecs.

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

Experimental and extension chain fields were renamed or removed from the chain shape.

```diff
-const chain = defineChain({
-  experimental_preconfirmationTime: 1_000,
-  custom: { slug: 'example' },
-  extendSchema: extendSchema<{ slug: string }>(),
+const chain = Chain.from({
+  preconfirmationTime: 1_000,
 })
```
