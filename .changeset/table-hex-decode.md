---
"viem": patch
---

Sped up `hexToBytes` by decoding through a nibble lookup table straight into the output, and `toBytes` by decoding `0x` strings in one pass instead of checking them with `isHex` first.
