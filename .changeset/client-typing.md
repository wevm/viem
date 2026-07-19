---
'viem': patch
---

Typed test-action RPC methods on clients extended with `testActions`.

```ts
const client = Client.create({ transport: http() }).extend(
  testActions({ mode: 'anvil' }),
)
await client.request({
  method: 'anvil_setBalance',
  params: ['0x…', '0x…'],
})
```
