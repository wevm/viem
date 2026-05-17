---
"viem": patch
---

Fixed `verifyHash` for Tempo `allowAccessKey` mode to support `secp256k1` keychain access keys (whose inner envelope does not carry a `publicKey`).
