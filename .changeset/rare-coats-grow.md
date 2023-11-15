---
"viem": patch
---

Fixed an issue where some consumer minifiers (ie. Terser, SWC) would drop `Function.prototype.name` causing client action overrides to be ignored.
