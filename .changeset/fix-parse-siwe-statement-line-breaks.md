---
"viem": patch
---

Rejected CR, LF, U+2028, and U+2029 in SIWE statements in `parseSiweMessage` and `createSiweMessage`, and anchored the parsed suffix to a line start so long inputs no longer take quadratic time.
