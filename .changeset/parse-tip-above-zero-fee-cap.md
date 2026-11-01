---
"viem": patch
---

Fixed `parseTransaction` not raising `TipAboveFeeCapError` when the encoded `maxFeePerGas` is zero.
