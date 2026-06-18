---
"viem": minor
---

Added the ability for `tempoActions` to attach a default `chain` to the Client: `tempoActions()` attaches `tempo` and `tempoActions({ testnet: true })` attaches `tempoModerato`, unless the Client was created with an explicit chain.
