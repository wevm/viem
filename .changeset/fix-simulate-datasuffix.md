---
'viem': patch
---

Fixed `contract.simulate` ignoring `dataSuffix`, causing simulation to validate different calldata than `contract.write` broadcasts.
