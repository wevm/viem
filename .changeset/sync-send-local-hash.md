---
"viem": patch
---

Changed `sendTransactionSync` and `writeContractSync` to derive the transaction hash from the sent transaction, not the node's error, when `eth_sendRawTransactionSync` returns error code 4.
