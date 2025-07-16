---
"viem": minor
---

**Types (Breaking):** Added `version` property to `toCoinbaseSmartAccount`, and add `version: '1.1'`. 

To migrate to this new type change in a current implementation, add  `version: '1'` as a property to `toCoinbaseSmartAccount`.
