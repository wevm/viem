---
"viem": minor
---

**`viem/tempo`:** Added `receivePolicy` actions for TIP-403 receive policies and the `ReceivePolicyGuard` precompile: `set`/`setSync`, `get`, `validate`, `getBlockedBalance`, `claim`/`claimSync`, `burn`/`burnSync`, and the `watchUpdated`/`watchBlocked`/`watchClaimed`/`watchBurned` watchers. Policy references accept the built-in `'allow-all'`/`'reject-all'` sentinels alongside custom `bigint` policy ids. Also re-exported `ReceivePolicyReceipt` (from `ox`) for decoding blocked-transfer claim receipts.
