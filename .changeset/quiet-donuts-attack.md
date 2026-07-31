---
"viem": patch
---

Fixed `TS2742` and `TS7056` when consumers export inferred Viem values, by making every type reachable from public signatures nameable through a `viem/_types/*` subpath and compiler-support re-exports.

```ts
// previously failed to emit a `.d.ts` without an explicit type annotation
export const client = Client.create({ chain: mainnet, transport: http() })
  .extend(publicActions())
```
