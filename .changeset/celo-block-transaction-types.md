---
"viem": patch
---

Fixed the Celo block formatter leaving `type` undefined on CIP-64 and deposit transactions, and `mint` unparsed on deposits, when `includeTransactions` is set.
