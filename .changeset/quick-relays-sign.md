---
"viem": patch
---

Fixed Tempo access key transactions failing by preserving the gas limit covered by fee payer signatures returned from `eth_fillTransaction`.
