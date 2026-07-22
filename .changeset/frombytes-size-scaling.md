---
"viem": patch
---

Fixed `bytesToBigInt` and `bytesToNumber` (and `fromBytes` with `to: "bigint" | "number"`) scaling the decoded value when a `size` larger than the input byte length was provided.
