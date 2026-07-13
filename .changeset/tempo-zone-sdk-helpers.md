---
'viem': patch
---

Added Tempo Zone helpers for preparing encrypted deposit recipients and withdrawals without broadcasting. Zone withdrawal actions now use `callbackGas` for the parent-chain callback limit, leaving `gas` for the Zone transaction limit.
