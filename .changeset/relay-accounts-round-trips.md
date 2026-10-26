---
"viem": patch
---

`viem/tempo`: Reduced `Relay.accounts` round trips: `account_getConfig` now reads the commitment without a prior block number request, and each config is written to the store once.
