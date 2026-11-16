---
"viem": patch
---

Sped up `bytesToString` and `hexToString` by reusing one `TextDecoder`, `normalizeSignature` by comparing characters directly, and `formatUnits` by trimming trailing zeros without a regular expression.
