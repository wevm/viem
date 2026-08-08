---
"viem": patch
---

Fixed `hexToBigInt` and `hexToNumber` throwing `RangeError: The number 1.5 cannot be converted to a BigInt` when `signed: true` is used with an odd-length hex value (e.g. the documented example `hexToBigInt('0x1a4', { signed: true })`, or minimal-encoded RPC quantities such as `0x0`). The byte size of the value is now rounded up.
