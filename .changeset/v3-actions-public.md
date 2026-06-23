---
"viem": major
---

Public actions were moved under the root `Actions` namespace and grouped by domain, and decorator methods were grouped under matching domain objects.

```diff
- import { getBalance } from 'viem/actions'
+ import { Actions } from 'viem'

- const balance = await getBalance(client, { address })
+ const balance = await Actions.address.getBalance(client, { address })

- const balance = await client.getBalance({ address })
+ const balance = await client.address.getBalance({ address })
```

Flat public action names were renamed to their namespaced v3 equivalents.

```diff
- getBalance(client, options)
- getCode(client, options)
- getDelegation(client, options)
- getProof(client, options)
- getStorageAt(client, options)
- getTransactionCount(client, options)
+ Actions.address.getBalance(client, options)
+ Actions.address.getCode(client, options)
+ Actions.address.getDelegation(client, options)
+ Actions.address.getProof(client, options)
+ Actions.address.getStorageAt(client, options)
+ Actions.address.getTransactionCount(client, options)

- getBlock(client, options)
- getBlockNumber(client, options)
- getBlockReceipts(client, options)
- getBlockTransactionCount(client, options)
+ Actions.block.get(client, options)
+ Actions.block.getNumber(client, options)
+ Actions.block.getReceipts(client, options)
+ Actions.block.getTransactionCount(client, options)

- getChainId(client)
+ Actions.chains.getId(client)

- getEip712Domain(client, options)
- getContractEvents(client, options)
- readContract(client, options)
+ Actions.contract.getEip712Domain(client, options)
+ Actions.contract.getLogs(client, options)
+ Actions.contract.read(client, options)

- estimateFeesPerGas(client, options)
- estimateMaxPriorityFeePerGas(client, options)
- getBlobBaseFee(client)
- getGasPrice(client)
- getFeeHistory(client, options)
+ Actions.fee.estimateFeesPerGas(client, options)
+ Actions.fee.estimateMaxPriorityFeePerGas(client, options)
+ Actions.fee.getBlobBaseFee(client)
+ Actions.fee.getGasPrice(client)
+ Actions.fee.getHistory(client, options)

- getLogs(client, options)
+ Actions.logs.get(client, options)

- fillTransaction(client, options)
- getTransaction(client, options)
- getTransactionConfirmations(client, options)
- getTransactionReceipt(client, options)
+ Actions.transaction.fill(client, options)
+ Actions.transaction.get(client, options)
+ Actions.transaction.getConfirmations(client, options)
+ Actions.transaction.getReceipt(client, options)
```

Public actions that default to a client block tag read `client.blockTag` instead of `client.experimental_blockTag`.

```diff
  const client = createPublicClient({
    chain: mainnet,
-   experimental_blockTag: 'safe',
+   blockTag: 'safe',
    transport: http(),
  })

- const block = await getBlock(client)
+ const block = await Actions.block.get(client)
```

Contract event log reads were renamed from `getContractEvents` to `Actions.contract.getLogs`.

```diff
- import { getContractEvents } from 'viem/actions'
+ import { Actions } from 'viem'

- const logs = await getContractEvents(client, {
+ const logs = await Actions.contract.getLogs(client, {
    abi,
    address,
    eventName: 'Transfer',
  })
```

Contract reads were renamed from `readContract` to `Actions.contract.read`.

```diff
- import { readContract } from 'viem/actions'
+ import { Actions } from 'viem'

- const balance = await readContract(client, {
+ const balance = await Actions.contract.read(client, {
    abi,
    address,
    functionName: 'balanceOf',
    args: [account],
  })
```
