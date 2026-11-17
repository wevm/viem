---
"viem": patch
---

Fixed `hashTypedData` to reject a fixed-length array (e.g. `uint256[2]`) whose value has a different number of elements, matching `ox` and the EIP-712 encoding.
