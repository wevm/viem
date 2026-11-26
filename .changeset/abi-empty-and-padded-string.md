---
"viem": patch
---

Fixed `encodeFunctionData`, `decodeFunctionResult` and the other ABI helpers throwing a `TypeError` instead of a "not found" error for an empty ABI, and `hexToString` and `bytesToString` returning `"\u0000"` instead of `""` for a padded empty string.
