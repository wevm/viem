---
'viem': patch
---

Added an optional `nonce` to `NonceManager` `reset` parameters. When a send fails after `consume` returned a nonce, `transaction.send` and `transaction.sendSync` now pass that nonce to `reset`, so a custom manager can tell which send failed. It is omitted when `consume` threw.
