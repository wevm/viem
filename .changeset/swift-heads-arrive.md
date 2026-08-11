---
"viem": patch
---

Added `watchBlockHeaders` for emitting formatted subscription headers without refetching full blocks.

```ts
watchBlockHeaders(client, { onBlockHeader })
```
