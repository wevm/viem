---
"viem": patch
---

Fixed an issue where a `nonceManager` would unexpectedly consume a nonce if `eth_fillTransaction` is not supported.
