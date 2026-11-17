---
"viem": patch
---

Limited the total local batch gateway response size of one CCIP Read lookup to 10 MiB, throwing `CcipRead.LookupLimitExceededError` once exceeded.
