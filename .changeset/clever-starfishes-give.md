---
"viem": patch
---

Fixed an issue where calling `encodePacked` with an empty `bytes[]` array would return an `Uint8Array` instead of `Hex` value.
