---
"viem": patch
---

Fixed `parseTransaction` in `viem/celo` dropping the signature (`r`, `s`, `v`, and `yParity`) of signed CIP-42 and CIP-64 transactions.
