---
"viem": patch
---

Added `Actions.passport.verify` for TIP-1142 passport owner bindings, and exported `Passport` from `viem/tempo`.

```ts
const valid = await client.passport.verify({
  account: '0x...',
  binding: '0x...',
  config,
  verifyProof: ({ proof, publicInput }) => verifyGroth16({ proof, publicInput }),
})
```
