---
"viem": patch
---

Fixed a `decodeAbiParameters` case where static arrays with a dynamic child would consume the size of the child instead of 32 bytes.
