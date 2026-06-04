---
"viem": minor
---

**Tempo:** Added experimental native multisig account support. Use `Account.fromMultisig` (and the re-exported `MultisigConfig` from `ox/tempo`) to derive a multisig sender, prepare a transaction by passing the multisig `account` to `prepareTransactionRequest` (the config is inferred from it), collect owner approvals via `signTransaction`, and broadcast with the collected `signatures`.
