---
"viem": patch
---

Fixed `nonceManager.reset` not clearing the cached nonce, causing stale nonces after failed transactions.
