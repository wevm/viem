---
'viem': patch
---

**ccip:** Limited the total response size of local batch gateway requests in one CCIP-Read lookup to 10 MiB, failing the lookup when it is exceeded.
