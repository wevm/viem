---
"viem": patch
---

Fixed `encodeAbiParameters` encoding odd-length hex `bytes` and `bytesN` values without left-padding them to whole bytes.
