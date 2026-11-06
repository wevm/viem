---
"viem": patch
---

Fixed `getEnsAddress` to resolve leading-zero Ethereum addresses and return `null` for the zero address instead of throwing when an offchain resolver returned an address-encoded response for `coinType: 60n`.
