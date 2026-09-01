---
'viem': patch
---

Fixed `isHash` returning `true` for odd-length hex strings. `size` rounds odd-length hex up to the next whole byte, so a 63-character hex string reported a size of 32 and passed the check. `isHash` now validates the length directly.
