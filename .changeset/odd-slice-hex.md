---
"viem": patch
---

Fixed `sliceHex` and `slice` slicing odd-length hex by nibble offsets instead of left-padding it to whole bytes first, matching `hexToBytes` and `sliceBytes`.
