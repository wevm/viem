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
- simulateContract(client, options)
- writeContract(client, options)
+ Actions.contract.getEip712Domain(client, options)
+ Actions.contract.getLogs(client, options)
+ Actions.contract.read(client, options)
+ Actions.contract.simulate(client, options)
+ Actions.contract.write(client, options)

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
- prepareTransactionRequest(client, options)
- sendTransaction(client, options)
- sendRawTransaction(client, options)
- signTransaction(client, options)
+ Actions.transaction.fill(client, options)
+ Actions.transaction.get(client, options)
+ Actions.transaction.getConfirmations(client, options)
+ Actions.transaction.getReceipt(client, options)
+ Actions.transaction.prepare(client, options)
+ Actions.transaction.send(client, options)
+ Actions.transaction.sendRaw(client, options)
+ Actions.transaction.sign(client, options)
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

Contract writes were renamed from `writeContract` to `Actions.contract.write`.

```diff
- import { writeContract } from 'viem/actions'
+ import { Actions } from 'viem'

- const hash = await writeContract(client, {
+ const hash = await Actions.contract.write(client, {
    abi,
    address,
    functionName: 'mint',
    args: [tokenId],
  })
```

Contract simulations were renamed from `simulateContract` to `Actions.contract.simulate`.

```diff
- import { simulateContract } from 'viem/actions'
+ import { Actions } from 'viem'

- const { request, result } = await simulateContract(client, {
+ const { request, result } = await Actions.contract.simulate(client, {
    abi,
    address,
    functionName: 'mint',
    args: [tokenId],
  })
```

`Actions.transaction.send` no longer falls back to `wallet_sendTransaction` when a JSON-RPC account's transport rejects `eth_sendTransaction`; it always sends via `eth_sendTransaction`.

`Actions.transaction.send` with a JSON-RPC account no longer throws when the client has no configured `chain`; it sends against the transport's current chain instead of requiring `chain` (or `chain: null`) to opt out of the chain assertion.

```diff
- // v2: threw ChainNotFoundError without a configured chain
- const client = createWalletClient({ transport: custom(window.ethereum) })
- await sendTransaction(client, { account, to, value })
+ // v3: sends against the transport's current chain
+ const client = Client.create({ transport: custom(window.ethereum) })
+ await Actions.transaction.send(client, { account, to, value })
```

`Actions.transaction.sendRaw`'s `serializedTransaction` option was renamed to `transaction`.

```diff
- import { sendRawTransaction } from 'viem/actions'
+ import { Actions } from 'viem'

- await sendRawTransaction(client, { serializedTransaction: '0x02f8…' })
+ await Actions.transaction.sendRaw(client, { transaction: '0x02f8…' })
```
