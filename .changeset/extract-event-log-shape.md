---
'viem': patch
---

Allowed `extractEvent`/`extractEvents` and the OP Stack log extractors to decode partial EIP-5792 call receipt logs without casts while preserving the input logs' block and transaction metadata in their return types.
