---
"viem": patch
---

Added optional `maxUsedGas` to `simulateBlocks` call results, preserving the per-call `maxUsedGas` reported by `eth_simulateV1`.

`maxUsedGas` is the node's measurement of the gas used by a call before gas refunds are applied – it is not a guaranteed minimum sufficient gas limit for the call. It is `undefined` against nodes that do not report it, and is available on both successful and failed call results.
