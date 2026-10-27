---
"viem": patch
---

Fixed `watchEvent` and `watchContractEvent` in the `eth_getLogs` fallback stalling for good when the blocks since the last poll exceeded the RPC Provider's block range, log count, or response size limit, repeating logs when an RPC node reported a lower block number, emitting logs from before a `fromBlock` past the latest block, ignoring `fromBlock: 1n`, and missing logs from the first polling interval without `fromBlock`.
