---
'viem': patch
---

Ensured `prepareTransactionRequest` fetched Tempo fee payer signatures when the caller's `parameters` option omitted `fees` or `gas`.
