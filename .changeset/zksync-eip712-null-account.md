---
"viem": patch
---

Updated `viem/zksync` `sendEip712Transaction` to send an unsigned `eth_sendTransaction` and `signEip712Transaction` to throw `AccountNotFoundError` when `account` is `null`, instead of using the Client's account.
