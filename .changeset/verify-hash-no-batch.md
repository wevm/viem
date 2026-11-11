---
"viem": patch
---

Fixed `verifyHash` sending its onchain verification calls through multicall batching, so they now run as separate `eth_call` requests.
