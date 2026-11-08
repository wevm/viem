---
"viem": patch
---

Fixed `getEnsAddress` to resolve leading-zero EVM addresses and return `null` for the zero address instead of throwing when an offchain resolver returned an address-encoded response for an Ethereum or EVM chain `coinType`.
