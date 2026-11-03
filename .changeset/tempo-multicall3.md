---
"viem": patch
---

Added the Multicall3 that Tempo Mainnet, Moderato and Devnet deploy at genesis to `tempo`, `tempoModerato` and `tempoDevnet`, so their clients batch and `multicall` through it instead of needing `deployless`.
