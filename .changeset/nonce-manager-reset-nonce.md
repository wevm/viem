---
"viem": patch
---

Added an optional `nonce` to `NonceManager` `reset` parameters, which `Actions.transaction.send` and `Actions.transaction.sendSync` now set to the consumed nonce when a send fails after `consume` returned.
