---
"viem": patch
---

Fixed `Actions.call` running CCIP-Read callbacks at the default block instead of the `blockNumber`, `blockTag`, or `blockHash` passed to it.
