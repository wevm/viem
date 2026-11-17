---
"viem": patch
---

`viem/tempo`: Reserved 5,000 gas for the fee payer's signature and fee token on sponsored requests, kept the gas of owner-approved configurable account requests, and verified configurable account signatures in `verifyHash`.
