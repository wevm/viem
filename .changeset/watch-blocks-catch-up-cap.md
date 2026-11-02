---
"viem": patch
---

Limited the default catch-up of `watchBlocks` to 100 missed blocks, so a longer gap emits only the latest block.
