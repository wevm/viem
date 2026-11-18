---
"viem": patch
---

Fixed `decodeAbiParameters`, `hexToString`, and `bytesToString` dropping a leading U+FEFF (byte order mark) from decoded strings.
