---
"viem": patch
---

Modify `chainId` check on `sendTransaction` to only perform `eth_chainId` check when a `chain` is set on client.
