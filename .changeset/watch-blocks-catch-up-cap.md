---
"viem": patch
---

Limited the default catch-up of `Actions.block.watch` to 100 missed blocks, so a longer gap emits only the latest block.
