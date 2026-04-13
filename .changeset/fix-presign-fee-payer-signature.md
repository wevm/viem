---
"viem": patch
---

`viem/tempo`: Fixed `Account.signTransaction` computing wrong presign hash when `feePayerSignature` is present by normalizing it to `null` before hashing.
