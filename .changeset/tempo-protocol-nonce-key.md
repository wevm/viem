---
"viem": patch
---

`viem/tempo`: Fixed `prepareTransactionRequest` defaulting `nonce` to `0` for `nonceKey: 0n`. The protocol nonce key now fills `nonce` from the account's transaction count or `nonceManager`.
