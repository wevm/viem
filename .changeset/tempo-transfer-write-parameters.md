---
"viem": patch
---

Fixed `Actions.token.transfer` and `Actions.token.transferSync` (`viem/tempo`) passing the transfer arguments to the write action, so a JSON-RPC account sending a `transferFrom` now sends the transaction from the account instead of `from`.
