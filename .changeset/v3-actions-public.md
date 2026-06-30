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

- addChain(client, { chain })
- switchChain(client, { id })
+ Actions.chains.add(client, { chain })
+ Actions.chains.switch(client, { id })

- signMessage(client, { account, message })
- signTypedData(client, { account, ...typedData })
+ Actions.signMessage(client, { account, message })
+ Actions.signTypedData(client, { account, ...typedData })

- estimateContractGas(client, options)
- getEip712Domain(client, options)
- getContractEvents(client, options)
- readContract(client, options)
- simulateContract(client, options)
- writeContract(client, options)
+ Actions.contract.estimateGas(client, options)
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
+ Actions.event.getLogs(client, options)

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

Contract deployments were renamed from `deployContract` to `Actions.contract.deploy`.

```diff
- import { deployContract } from 'viem/actions'
+ import { Actions } from 'viem'

- const hash = await deployContract(client, {
+ const hash = await Actions.contract.deploy(client, {
    abi,
    bytecode,
    args,
  })
```

Sync transaction and contract writes were renamed to their v3 action namespaces.

```diff
- import { sendTransactionSync, sendRawTransactionSync, writeContractSync } from 'viem/actions'
+ import { Actions } from 'viem'

- const receipt = await sendTransactionSync(client, { to, value })
+ const receipt = await Actions.transaction.sendSync(client, { to, value })

- const receipt = await sendRawTransactionSync(client, { serializedTransaction })
+ const receipt = await Actions.transaction.sendRawSync(client, { transaction })

- const receipt = await writeContractSync(client, {
+ const receipt = await Actions.contract.writeSync(client, {
    abi,
    address,
    functionName,
  })
```

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

Filter lifecycle actions were renamed to the `filter` namespace.

```diff
- import { getFilterChanges, getFilterLogs, uninstallFilter } from 'viem/actions'
+ import { Actions } from 'viem'

- const changes = await getFilterChanges(client, { filter })
- const logs = await getFilterLogs(client, { filter })
- const uninstalled = await uninstallFilter(client, { filter })
+ const changes = await Actions.filter.getChanges(client, { filter })
+ const logs = await Actions.filter.getLogs(client, { filter })
+ const uninstalled = await Actions.filter.uninstall(client, { filter })
```

Block/event/transaction watchers were renamed to their owning domain namespaces and now return a watcher handle (`onX`/`onError`/`off` + async iterable) instead of a bare unwatch function.

```diff
- import { watchBlocks } from 'viem/actions'
+ import { Actions } from 'viem'

- const unwatch = watchBlocks(client, { onBlock: (block) => console.log(block) })
+ const watch = Actions.block.watch(client)
+ watch.onBlock((block) => console.log(block))
+ // later: watch.off()

- const unwatch = watchPendingTransactions(client, { onTransactions: (hashes) => console.log(hashes) })
+ const watch = Actions.transaction.watchPending(client)
+ watch.onTransactions((hashes) => console.log(hashes))
+ // later: watch.off()

- const unwatch = watchEvent(client, { event, onLogs: (logs) => console.log(logs) })
+ const watch = Actions.event.watch(client, { event })
+ watch.onLogs((logs) => console.log(logs))
+ // later: watch.off()

- const unwatch = watchContractEvent(client, { abi, eventName, onLogs: (logs) => console.log(logs) })
+ const watch = Actions.contract.watchEvent(client, { abi, eventName })
+ watch.onLogs((logs) => console.log(logs))
+ // later: watch.off()
```

Filter producers were renamed to their owning domain namespaces.

```diff
- import { createBlockFilter, createPendingTransactionFilter, createEventFilter, createContractEventFilter } from 'viem/actions'
+ import { Actions } from 'viem'

- const blockFilter = await createBlockFilter(client)
- const txFilter = await createPendingTransactionFilter(client)
- const eventFilter = await createEventFilter(client, { event })
- const contractFilter = await createContractEventFilter(client, { abi, eventName })
+ const blockFilter = await Actions.block.createFilter(client)
+ const txFilter = await Actions.transaction.createPendingFilter(client)
+ const eventFilter = await Actions.event.createFilter(client, { event })
+ const contractFilter = await Actions.contract.createEventFilter(client, { abi, eventName })
```

Wallet JSON-RPC actions were grouped under the `wallet` namespace, and the EIP-7702 authorization actions were folded in from `viem/experimental`.

```diff
- import { getAddresses, requestAddresses, getPermissions, requestPermissions, watchAsset } from 'viem/actions'
+ import { Actions } from 'viem'

- const addresses = await getAddresses(client)
- const requested = await requestAddresses(client)
- const permissions = await getPermissions(client)
- const requestedPermissions = await requestPermissions(client, { eth_accounts: {} })
- const success = await watchAsset(client, { type: 'ERC20', options })
+ const addresses = await Actions.wallet.getAddresses(client)
+ const requested = await Actions.wallet.requestAddresses(client)
+ const permissions = await Actions.wallet.getPermissions(client)
+ const requestedPermissions = await Actions.wallet.requestPermissions(client, { eth_accounts: {} })
+ const success = await Actions.wallet.watchAsset(client, { type: 'ERC20', options })

- import { prepareAuthorization, signAuthorization } from 'viem/experimental'
+ import { Actions } from 'viem'

- const authorization = await prepareAuthorization(client, { contractAddress })
- const signed = await signAuthorization(client, { contractAddress })
+ const authorization = await Actions.wallet.prepareAuthorization(client, { address })
+ const signed = await Actions.wallet.signAuthorization(client, { address })
```
