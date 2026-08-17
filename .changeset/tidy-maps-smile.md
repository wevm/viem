---
'viem': patch
---

Updated Tempo multisig requests to infer config versions, support multisig key authorizations, and use the renamed initial config input.

```ts
const request = await client.prepareTransactionRequest({
  account,
  to: recipient,
})
```
