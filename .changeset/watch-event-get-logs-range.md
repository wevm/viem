---
"viem": patch
---

Fixed `Actions.event.watch` and `Actions.contract.watchEvent` in the `eth_getLogs` fallback stalling for good once the blocks since the last poll exceeded the RPC Provider's block range, log count or response size limit, repeating logs when an RPC node reported a lower block number, missing logs from the first polling interval, and ignoring `strict`.
