---
"viem": patch
---

Fixed `validateTypedData` skipping array members, so out-of-range integers, invalid addresses, and mismatched `bytes<M>` sizes are now caught inside array-typed fields.
