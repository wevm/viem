---
"viem": patch
---

Added wallet `connect`, available as `client.connect` on Wallet Clients and as `connect` from `viem/actions`.

Added Tempo wallet actions under `tempoActions()` and `Actions.wallet`: `sendTransactionSync`, `writeContractSync`, `sendCallsSync`, `authorizeAccessKey`, and `revokeAccessKey`. Tempo chains also support typed `authorizeAccessKey` capabilities for `client.connect`.
