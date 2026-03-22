---
"viem": patch
---

Fixed `nonceManager.reset()` to also clear cached nonces from `nonceMap`, preventing stale nonce values after failed transactions.
