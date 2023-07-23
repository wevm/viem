---
"viem": patch
---

Fixed an issue where `parseUnits` would throw `Cannot convert to a BigInt` for large numbers with a fraction component.
