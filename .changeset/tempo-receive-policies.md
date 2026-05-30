---
"viem": minor
---

**`viem/tempo`:** Added `receivePolicy` actions (`set`/`setSync`, `get`, `validate`, `getBlockedBalance`, `claim`/`claimSync`, `burn`/`burnSync`, and the `watchUpdated`/`watchBlocked`/`watchClaimed`/`watchBurned` watchers) for TIP-403 receive policies and the `ReceivePolicyGuard` precompile, where policy references accept the built-in `'allow-all'`/`'reject-all'` sentinels alongside custom `bigint` policy ids, and re-exported `ReceivePolicyReceipt` (from `ox`) for decoding blocked-transfer claim receipts.
