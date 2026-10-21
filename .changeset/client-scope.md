---
"viem": patch
---

Added `client.scope` for creating a Client that does not share in-flight requests, cached values, or request batches with other Clients.

```ts
const scoped = client.scope({ signal: request.signal })
const blockNumber = await scoped.getBlockNumber()
```
