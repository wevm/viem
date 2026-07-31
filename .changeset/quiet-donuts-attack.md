---
"viem": patch
---

Fixed `TS2742` when a consumer re-exports an inferred Viem value, by adding a `viem/_types/*` subpath plus hidden compiler-support re-exports for the `ox` and `abitype` types reachable from public signatures.

```ts
// previously failed to emit a `.d.ts` without an explicit type annotation
export const client = Client.create({ chain: mainnet, transport: http() })
  .extend(publicActions())
```
