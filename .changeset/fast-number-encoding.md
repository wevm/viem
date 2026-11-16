---
"viem": patch
---

Sped up `numberToHex` for unsigned values, `hexToNumber` for safe integers, `bytesToNumber` and `bytesToBigInt` for unsigned values of up to 6 significant bytes, and signed `hexToBigInt` for negative values.
