---
'viem': minor
---

Added `Actions.getAction` for resolving Client-attached action overrides, consulted by core Actions for nested action calls.

```ts
const client = Client.create({ ... }).extend((client) => ({
  transaction: {
    send: (options) => Actions.transaction.send(client, { ...options, nonce: 69 }),
  },
}))

// Dispatches its transaction through the `transaction.send` override.
await Actions.contract.write(client, { ... })
```
