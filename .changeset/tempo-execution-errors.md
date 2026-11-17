---
"viem": patch
---

`viem/tempo`: Added typed `TempoExecutionError` errors to Tempo actions, with per-namespace subclasses (such as `Actions.accessKey.AccessKeySpendingLimitExceededError`) carrying decoded arguments, fetched onchain details, and resolution hints.
