---
"viem": minor
---

**Tempo:** Added experimental native multisig account support. Use `Account.fromMultisig` (and the re-exported `MultisigConfig` from `ox/tempo`) to derive a multisig sender, prepare a transaction with `multisig: config`, collect owner approvals via `signTransaction`, and broadcast with the collected `signatures`.
