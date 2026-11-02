---
"viem": patch
---

Fixed `sendTransactionSync` and `writeContractSync` failing at once and freeing the nonce when the node had accepted the transaction but stopped waiting for its receipt (`eth_sendRawTransactionSync` error code 4), even if the error had no transaction hash, and stopped `fallback` from sending that transaction to the next node.
