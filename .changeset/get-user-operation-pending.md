---
'viem': patch
---

Fixed `getUserOperation` throwing `Cannot convert null to a BigInt` for pending User Operations, and made `blockHash`, `blockNumber`, and `transactionHash` nullable on its return value (as well as on `GetUserOperationByHashReturnType`) to reflect what Bundlers return while a User Operation is in the mempool.
