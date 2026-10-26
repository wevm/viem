---
"viem": patch
---

`viem/tempo`: Keyed `Relay.accounts` stored configs by chain ID so `account_getConfig` no longer serves a config stored for another chain (configs stored under the previous key are no longer read), added a `resolveConfig` option that resolves and stores configs the store does not hold, and reduced round trips by reading the commitment without a prior block number request and writing each config once.
