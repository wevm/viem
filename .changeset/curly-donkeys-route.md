---
'viem': patch
---

Added chain inference to `Multisig.handleRequest` downstream request options.

```ts
const handle = Multisig.handleRequest(
  (request, options) => getClient(options?.chainId).request(request),
  { store },
)
```
