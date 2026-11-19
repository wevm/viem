---
"viem": patch
---

Rejected CR, LF, U+2028, and U+2029 in SIWE statements in `parseSiweMessage` and `createSiweMessage`, so parsed fields can no longer omit part of the signed statement.
