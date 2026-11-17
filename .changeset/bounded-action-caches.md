---
"viem": patch
---

Bounded the in-memory response caches behind `Actions.block.getNumber`, `Actions.erc7821.supportsExecutionMode`, and OP Stack `getPortalVersion` to 8192 entries each.
