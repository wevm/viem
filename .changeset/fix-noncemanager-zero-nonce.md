---
'viem': patch
---

Fixed `NonceManager` handing out a duplicate nonce when the previously consumed nonce was `0`.
