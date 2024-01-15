---
"viem": minor
---

Refactored ABI decoding implementation to use a cursor instead of array copies, and prevent excessive recursive pointers.