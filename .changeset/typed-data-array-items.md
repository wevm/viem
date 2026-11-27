---
"viem": patch
---

Fixed `validateTypedData` accepting out-of-range integers, invalid addresses and wrong-size `bytes<M>` values inside primitive array fields such as `uint8[]` or `address[]`.
