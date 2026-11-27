---
"viem": patch
---

Added `blockAccessListHash` ([EIP-7928](https://eips.ethereum.org/EIPS/eip-7928)) and `slotNumber` ([EIP-7843](https://eips.ethereum.org/EIPS/eip-7843)) to the `Block` and `RpcBlock` types, and formatted `slotNumber` as a `bigint` in `formatBlock`, `getBlock`, `watchBlocks`, and `simulateBlocks`.
