---
"viem": patch
---

`viem/tempo`: Fixed sponsored transactions failing with `intrinsic gas too low` on T14. `estimateGas` and `fillTransaction` now send the zero fee payer signature marker when a fee payer signs later, so the node includes the fee payer's account access in the gas limit.
