---
"viem": patch
---

Reduced the bundle size of `serializeSignature`, `parseSignature`, `serializeCompactSignature`, `parseCompactSignature`, `generatePrivateKey` and `isErc8010Signature` by no longer bundling the secp256k1 curve.
