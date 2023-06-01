---
"viem": patch
---

Added ability to hash data representation of `message` via a `raw` attribute in `signMessage`, `verifyMessage`, `recoverMessageAddress`.

```ts
await walletClient.signMessage({
  message: { raw: '0x68656c6c6f20776f726c64' }
})
```
