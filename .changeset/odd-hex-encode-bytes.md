---
"viem": patch
---

Fixed `encodeAbiParameters` and `encodePacked` encoding odd-length hex `bytes` values (and `bytesN` values in `encodeAbiParameters`) without left-padding them to whole bytes.
