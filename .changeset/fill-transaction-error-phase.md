---
"viem": patch
---

Added an `afterFillTransactionError` phase to chain `prepareTransactionRequest` hooks that retries `eth_fillTransaction` once with the request the hook returns.

```ts
const chain = defineChain({
  // ...
  prepareTransactionRequest: [
    async (request, { error, phase }) => {
      if (phase === 'afterFillTransactionError') return retryable(error) ? fixed(request) : undefined
      return request
    },
    { runAt: ['beforeFillTransaction', 'afterFillTransactionError'] },
  ],
})
```
