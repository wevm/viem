---
"viem": patch
---

Added an optional `nonce` to `NonceManager` `reset` parameters, which `sendTransaction` and `sendTransactionSync` now set to the consumed nonce when a send fails after `consume` returned.
