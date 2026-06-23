---
"viem": major
---

Test actions were moved from the flat `viem/actions` entrypoint and flat test-client decorator methods into the root `Actions.test` namespace and grouped decorator namespaces.

```diff
- import { mine, setBalance } from 'viem/actions'
+ import { Actions, testActions } from 'viem'

- await mine(client, { blocks: 1 })
- await setBalance(client, { address, value })
+ await Actions.test.block.mine(client, { blocks: 1 })
+ await Actions.test.address.setBalance(client, { address, value })

  const client = Client.create({ transport }).extend(testActions())
- await client.mine({ blocks: 1 })
- await client.setBalance({ address, value })
+ await client.block.mine({ blocks: 1 })
+ await client.address.setBalance({ address, value })
```

Test actions were renamed within their new namespaces.

```diff
- await client.setBlockGasLimit({ gasLimit })
- await client.setNextBlockBaseFeePerGas({ baseFeePerGas })
- await client.setNextBlockTimestamp({ timestamp })
- await client.setBlockTimestampInterval({ interval })
- await client.removeBlockTimestampInterval()
- await client.impersonateAccount({ address })
- await client.stopImpersonatingAccount({ address })
- await client.dumpState()
- await client.loadState({ state })
- await client.getTxpoolStatus()
- await client.inspectTxpool()
+ await client.block.setGasLimit({ gasLimit })
+ await client.block.setNextBaseFeePerGas({ baseFeePerGas })
+ await client.block.setNextTimestamp({ timestamp })
+ await client.block.setTimestampInterval({ interval })
+ await client.block.removeTimestampInterval()
+ await client.address.impersonate({ address })
+ await client.address.stopImpersonating({ address })
+ await client.state.dump()
+ await client.state.load({ state })
+ await client.txpool.getStatus()
+ await client.txpool.inspect()
```

Test actions that kept their leaf names were still moved under the `address`, `block`, `node`, `state`, or `txpool` namespaces.

```diff
- await client.setCode({ address, bytecode })
- await client.setNonce({ address, nonce })
- await client.setStorageAt({ address, index, value })
- await client.getAutomine()
- await client.setAutomine(true)
- await client.setIntervalMining({ interval })
- await client.setCoinbase({ address })
- await client.increaseTime({ seconds })
- await client.setRpcUrl('http://127.0.0.1:8545')
- await client.setLoggingEnabled(true)
- await client.setMinGasPrice({ gasPrice })
- await client.snapshot()
- await client.revert({ id })
- await client.reset({ blockNumber })
- await client.dropTransaction({ hash })
+ await client.address.setCode({ address, bytecode })
+ await client.address.setNonce({ address, nonce })
+ await client.address.setStorageAt({ address, index, value })
+ await client.block.getAutomine()
+ await client.block.setAutomine({ enabled: true })
+ await client.block.setIntervalMining({ interval })
+ await client.block.setCoinbase({ address })
+ await client.block.increaseTime({ seconds })
+ await client.node.setRpcUrl({ jsonRpcUrl: 'http://127.0.0.1:8545' })
+ await client.node.setLoggingEnabled({ enabled: true })
+ await client.node.setMinGasPrice({ gasPrice })
+ await client.state.snapshot()
+ await client.state.revert({ id })
+ await client.state.reset({ blockNumber })
+ await client.txpool.dropTransaction({ hash })
```

The `getTxpoolContent` and `sendUnsignedTransaction` test actions were removed.

```diff
- import { getTxpoolContent, sendUnsignedTransaction } from 'viem/actions'
-
- const content = await getTxpoolContent(client)
- const hash = await sendUnsignedTransaction(client, { from, to, value })
```
