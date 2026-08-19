---
"viem": patch
---

Added pending multisig receipts and direct owner approval submission through Tempo wallet actions.

```ts
const receipt = await sendTransactionSync(client, { ...request, account: owner })
if (receipt.status === 'pending')
  console.log(receipt.multisigWeight, receipt.multisigThreshold)
```
