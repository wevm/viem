---
"viem": patch
---

`viem/tempo`: Supported calling token `.call` builders without a Client (restores the pre-`2.54` call signature). When the Client is omitted, `token` must be a TIP20 token id or contract address, and formatted amounts require explicit `decimals`.
