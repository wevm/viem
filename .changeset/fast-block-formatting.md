---
"viem": patch
---

Sped up `formatTransaction` and the OP Stack, Celo, and zkSync block formatters by building transactions without `delete` and formatting each block transaction once.
