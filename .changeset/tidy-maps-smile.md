---
'viem': patch
---

Updated Tempo multisig requests for versioned approvals, multisig key authorizations, and the renamed initial config input.

```ts
const request = await client.prepareTransactionRequest({
  account,
  multisigVersion: 1n,
  to: recipient,
})
```
