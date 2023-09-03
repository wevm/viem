---
"viem": patch
---

Removed hardcoded `defaultPriorityFee` on OP Stack chains in favor of fetching it from `eth_maxPriorityFeePerGas`.
