---
"viem": patch
---

Added an optional `nonce` to `NonceManager` `reset` parameters. When a send fails after `consume` returned a nonce, `sendTransaction` and `sendTransactionSync` now pass that nonce to `reset`, so a custom Nonce Manager can tell which send failed. It is omitted when `consume` threw.
