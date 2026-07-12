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

- createAccessList(client, options)
- fillTransaction(client, options)
- getTransaction(client, options)
- getTransactionConfirmations(client, options)
- getRawTransaction(client, options)
- getTransactionReceipt(client, options)
- prepareTransactionRequest(client, options)
- sendTransaction(client, options)
- sendRawTransaction(client, options)
- signTransaction(client, options)
+ Actions.transaction.createAccessList(client, options)
+ Actions.transaction.fill(client, options)
+ Actions.transaction.get(client, options)
+ Actions.transaction.getConfirmations(client, options)
+ Actions.transaction.getRaw(client, options)
+ Actions.transaction.getReceipt(client, options)
+ Actions.transaction.prepare(client, options)
+ Actions.transaction.send(client, options)
+ Actions.transaction.sendRaw(client, options)
+ Actions.transaction.sign(client, options)
```

`defaultPrepareTransactionRequestParameters` moved to `Actions.transaction.defaultParameters`.

```diff
- import { defaultPrepareTransactionRequestParameters } from 'viem'
+ import { Actions } from 'viem'

- defaultPrepareTransactionRequestParameters
+ Actions.transaction.defaultParameters
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

Transaction receipt and block-number waiters moved to their owning namespaces and began returning watcher handles.

```diff
-const receipt = await waitForTransactionReceipt(client, { hash, onReplaced })
+const receiptWatcher = Actions.transaction.waitForReceipt(client, { hash })
+receiptWatcher.onReplaced(onReplaced)
+const receipt = await receiptWatcher.receipt

-const unwatch = watchBlockNumber(client, { onBlockNumber })
+const blockWatcher = Actions.block.watchNumber(client)
+blockWatcher.onBlockNumber(onBlockNumber)
```

Flat watcher callback aliases were removed in favor of signatures inferred from watcher registration methods.

```diff
-import type { OnBlockNumberParameter, OnTransactionsParameter, WatchEventOnLogsFn } from 'viem/actions'
+import { Actions } from 'viem'

+type OnBlockNumber = Parameters<Actions.block.watchNumber.OnBlockNumberFn>[0]
+type OnTransactions = Parameters<Actions.transaction.watchPending.OnTransactionsFn>[0]
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

The ERC-7846 connection actions and ERC-7811 `getAssets` moved from their experimental subpaths to the stable `wallet` namespace.

```diff
- import { getAssets } from 'viem/experimental/erc7811'
- import { connect, disconnect } from 'viem/experimental/erc7846'
+ import { Actions } from 'viem'

- const { accounts } = await connect(client)
- await disconnect(client)
- const assets = await getAssets(client)
+ const { accounts } = await Actions.wallet.connect(client)
+ await Actions.wallet.disconnect(client)
+ const assets = await Actions.wallet.getAssets(client)
```

The ERC-7821 executor actions moved from their experimental subpath to `Actions.erc7821`, while the decorator became root `erc7821Actions()`.

```diff
- import { erc7821Actions } from 'viem/experimental'
- import { execute, executeBatches, supportsExecutionMode } from 'viem/experimental/erc7821'
+ import { Actions, erc7821Actions } from 'viem'

- const hash = await execute(client, { address, calls })
- const batchHash = await executeBatches(client, { address, batches })
- const supported = await supportsExecutionMode(client, { address })
+ const hash = await Actions.erc7821.execute(client, { address, calls })
+ const batchHash = await Actions.erc7821.executeBatches(client, { address, batches })
+ const supported = await Actions.erc7821.supportsExecutionMode(client, { address })

- type Decorator = Erc7821Actions
+ type Decorator = erc7821Actions.Decorator
```

ERC-7821 codecs and errors moved to Ox and `Actions.erc7821`, while `getExecuteError` became internal.

```diff
- import {
-   encodeCalls,
-   encodeExecuteBatchesData,
-   encodeExecuteData,
-   getExecuteError,
-   ExecuteUnsupportedError,
-   FunctionSelectorNotRecognizedError,
- } from 'viem/experimental/erc7821'
+ import { Calls, Execute } from 'ox/erc7821'
+ import { Actions } from 'viem'

- encodeCalls(calls)
- encodeExecuteData({ calls })
- encodeExecuteBatchesData({ batches })
- getExecuteError(error, options)
+ // Encode ABI-backed call data first.
+ Calls.encode(calls)
+ Execute.encodeData(calls)
+ Execute.encodeBatchOfBatchesData(batches)
+ Actions.erc7821.ExecuteUnsupportedError
+ Actions.erc7821.FunctionSelectorNotRecognizedError
+ // Error normalization is internal.
```

The deprecated `writeContracts` and `eip5792Actions` exports were replaced by ABI-aware `Actions.wallet.sendCalls` and `walletActions()`.

```diff
- import { eip5792Actions, writeContracts } from 'viem/experimental'
+ import { Actions, walletActions } from 'viem'

- client.extend(eip5792Actions())
- await writeContracts(client, {
-   contracts: [{ address, abi, functionName, args }],
- })
+ client.extend(walletActions())
+ await Actions.wallet.sendCalls(client, {
+   calls: [{ to: address, abi, functionName, args }],
+ })
```

The EIP-5792 wallet actions were grouped under the `wallet` namespace.

```diff
- import { sendCalls, sendCallsSync, getCallsStatus, getCapabilities, showCallsStatus, waitForCallsStatus } from 'viem/actions'
+ import { Actions } from 'viem'

- const { id } = await sendCalls(client, { calls })
- const status = await sendCallsSync(client, { calls })
- const callsStatus = await getCallsStatus(client, { id })
- const capabilities = await getCapabilities(client)
- await showCallsStatus(client, { id })
- const confirmed = await waitForCallsStatus(client, { id })
+ const { id } = await Actions.wallet.sendCalls(client, { calls })
+ const status = await Actions.wallet.sendCallsSync(client, { calls })
+ const callsStatus = await Actions.wallet.getCallsStatus(client, { id })
+ const capabilities = await Actions.wallet.getCapabilities(client)
+ await Actions.wallet.showCallsStatus(client, { id })
+ const confirmed = await Actions.wallet.waitForCallsStatus(client, { id })
```

The `multicall` action was redesigned: it accepts the same typed calls with `contracts` renamed to `calls` and per-item `address` renamed to `to`, and returns a `{ results }` envelope. `allowFailure`, `batchSize`, `multicallAddress`, and `deployless` carry over.

```diff
  const results = await multicall(client, {
-   contracts: [
-     { address, abi, functionName: 'balanceOf', args },
-     { address, abi, functionName: 'totalSupply' },
-   ],
- })
+ const { results } = await Actions.multicall(client, {
+   calls: [
+     { to: address, abi, functionName: 'balanceOf', args },
+     { to: address, abi, functionName: 'totalSupply' },
+   ],
+ })
```

`multicall` now executes via `eth_simulateV1` by default and transparently falls back to a multicall3 `aggregate3` batch on nodes without support (cached per client). Pin `mode: 'multicall'` for the previous semantics (always `aggregate3`, no detection request, multicall3 `msg.sender`), or `mode: 'simulate'` for deterministic rich results (`block`, per-call `gasUsed`/`logs`, `traceAssetChanges`).

`simulateBlocks` moved under the `block` namespace as `block.simulate`, `multicall` lands flat at `Actions.multicall` (decorator `client.multicall`), and the per-block/state override option is singular `stateOverride` with the ox record shape.

```diff
- const result = await simulateBlocks(client, {
+ const result = await Actions.block.simulate(client, {
    blocks: [{
      calls,
-     stateOverrides: [{ address: account, balance: parseEther('10000') }],
+     stateOverride: { [account]: { balance: Value.fromEther('10000') } },
    }],
  })
```

The onchain verification actions stay flat with their v2 names (`Actions.verifyHash` / `Actions.verifyMessage` / `Actions.verifyTypedData`), and `verifySiweMessage` moved out of `viem/siwe` to join them.

```diff
- import { verifyHash, verifyMessage, verifyTypedData } from 'viem/actions'
- import { verifySiweMessage } from 'viem/siwe'
+ import { Actions } from 'viem'

- const valid = await verifyHash(client, { address, hash, signature })
+ const valid = await Actions.verifyHash(client, { address, hash, signature })

- const valid = await verifySiweMessage(client, { message, signature })
+ const valid = await Actions.verifySiweMessage(client, { message, signature })
```

Added EIP-1898 block-hash context to the onchain verification actions and chain verification hooks.

```diff
  await Actions.verifyHash(client, {
    address,
-   blockNumber,
+   blockHash,
+   requireCanonical: true,
    hash,
    signature,
  })
```

`verifyHash` drops the deprecated `universalSignatureVerifierAddress` alias (use `erc6492VerifierAddress`) and the `chain` override (the client's chain is used); signature objects follow the ox shape (`yParity`, no `v`). The `chain.verifyHash` hook now lives on the `Chain` type for chains with custom account verification.

The ENS actions were grouped under the `ens` namespace, and CCIP-read (`OffchainLookup` reverts) now resolves inside `call` for any contract, honoring the client's `ccipRead` option.

```diff
- import { getEnsAddress, getEnsAvatar, getEnsName, getEnsResolver, getEnsText } from 'viem/actions'
+ import { Actions } from 'viem'

- const address = await getEnsAddress(client, { name })
- const avatar = await getEnsAvatar(client, { name })
- const ensName = await getEnsName(client, { address })
- const resolver = await getEnsResolver(client, { name })
- const twitter = await getEnsText(client, { name, key: 'com.twitter' })
+ const address = await Actions.ens.getAddress(client, { name })
+ const avatar = await Actions.ens.getAvatar(client, { name })
+ const ensName = await Actions.ens.getName(client, { address })
+ const resolver = await Actions.ens.getResolver(client, { name })
+ const twitter = await Actions.ens.getText(client, { name, key: 'com.twitter' })
```

The ENS name primitives live on the `Ens` utility namespace (`Ens.normalize`, `Ens.namehash`, `Ens.labelhash`, `Ens.toCoinType` taking/returning `bigint`).

CCIP Read was disabled by default and began requiring an explicit request policy.

```diff
- import { Client, http } from 'viem'
+ import { CcipRead, Client, http } from 'viem'

  const client = Client.create({
+   ccipRead: CcipRead.tunnel({
+     batchGateways: ['https://ccip-v3.ens.xyz'],
+   }),
    transport: http(),
  })
```

A tunnel with a trusted HTTPS batch gateway became the recommended request policy. `CcipRead.request` provided defense in depth only; server applications were directed to a trusted proxy or custom gateway allowlist because portable `fetch` cannot pin DNS results to connections.

The CCIP-read callback call began executing at the original call's block context (`blockNumber`/`blockTag`); previously the callback always ran against the latest block.

CCIP gateway requests and batch tunnels moved to `CcipRead`, tunnel overrides renamed `ccipRequest` to `request`, and transport request options began flowing through tunnels.

```diff
- import {
-   ccipFetch,
-   ccipReadTunnel,
-   ccipRequest,
-   type CcipReadTunnelParameters,
-   type CcipRequestErrorType,
-   type CcipRequestParameters,
- } from 'viem'
+ import { CcipRead } from 'viem'

- const data = await ccipRequest(options)
- const legacyData = await ccipFetch(options)
+ const data = await CcipRead.request(options)

- const ccipRead = ccipReadTunnel({ batchGateways, ccipRequest })
+ const ccipRead = CcipRead.tunnel({
+   batchGateways,
+   request: CcipRead.request,
+ })

- type RequestOptions = CcipRequestParameters
- type RequestError = CcipRequestErrorType
- type TunnelOptions = CcipReadTunnelParameters
+ type RequestOptions = CcipRead.request.Options
+ type RequestError = CcipRead.request.ErrorType
+ type TunnelOptions = CcipRead.tunnel.Options
```

`CcipRead.request` rejected unsafe URL forms and redirects and redacted gateway payloads, while `CcipRead.tunnel` redacted batch failures and rejected malformed success arrays instead of resolving `undefined`.

Raw `offchainLookup` resolution became internal to `Actions.call`, and Ox construction replaced its ABI item and selector constants.

```diff
- import {
-   offchainLookup,
-   offchainLookupAbiItem,
-   offchainLookupSignature,
-   type OffchainLookupErrorType,
- } from 'viem'
+ import { AbiError } from 'ox'
+ import { Actions, CcipRead } from 'viem'

- const data = await offchainLookup(client, { data: revertData, to })
+ const { data } = await Actions.call(client, { data: callData, to })

- offchainLookupAbiItem
- offchainLookupSignature
+ const abiError = AbiError.from(
+   'error OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData)',
+ )
+ const selector = AbiError.getSelector(abiError)

- type LookupError = OffchainLookupErrorType
+ type LookupError = CcipRead.LookupError
```

`Actions.transaction.prepare` no longer feeds the fees it derives back into its internal gas estimation (nodes cap estimable gas by `balance / fee`, which broke senders that do not hold the fee themselves, e.g. sponsored transactions); caller-supplied fees are still forwarded.

`Actions.transaction.estimateGas` encodes the request via the chain's `schema.transactionRequest` codec when declared, so chain-specific request fields reach the node.

Passing `strict: true` to `contract.getLogs`, `contract.watchEvent`, `contract.createEventFilter`, and `event.createFilter` now narrows decoded `log.args` to the required (non-partial) shape at the type level; the widened property type previously defeated the generic's inference.
