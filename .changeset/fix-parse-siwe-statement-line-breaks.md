---
"viem": patch
---

Reject CR, LF, U+2028, and U+2029 inside the SIWE statement when parsing EIP-4361 messages so parsed fields cannot disagree with the signed text.
