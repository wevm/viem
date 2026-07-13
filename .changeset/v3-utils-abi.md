---
"viem": major
---

ABI parameter encoding and decoding moved from flat utilities to the `AbiParameters` namespace.

```diff
- import { encodeAbiParameters, decodeAbiParameters, parseAbiParameters } from 'viem'
+ import { AbiParameters } from 'viem'

- const parameters = parseAbiParameters('address to, uint256 amount')
- const data = encodeAbiParameters(parameters, [to, amount])
- const values = decodeAbiParameters(parameters, data)
+ const parameters = AbiParameters.from('address to, uint256 amount')
+ const data = AbiParameters.encode(parameters, [to, amount])
+ const values = AbiParameters.decode(parameters, data)
```

ABI function data and result utilities moved from flat utilities to the `AbiFunction` namespace.

```diff
- import { decodeFunctionData, decodeFunctionResult, encodeFunctionData, encodeFunctionResult, parseAbi } from 'viem'
+ import { Abi, AbiFunction } from 'viem'

- const abi = parseAbi(['function balanceOf(address) view returns (uint256)'])
- const data = encodeFunctionData({ abi, functionName: 'balanceOf', args: [address] })
- const call = decodeFunctionData({ abi, data })
- const result = encodeFunctionResult({ abi, functionName: 'balanceOf', result: 1n })
- const value = decodeFunctionResult({ abi, functionName: 'balanceOf', data: result })
+ const abi = Abi.from(['function balanceOf(address) view returns (uint256)'])
+ const data = AbiFunction.encodeData(abi, 'balanceOf', [address])
+ const call = AbiFunction.decodeData(abi, data)
+ const result = AbiFunction.encodeResult(abi, 'balanceOf', [1n])
+ const value = AbiFunction.decodeResult(abi, 'balanceOf', result)
```

ABI event topic and log utilities moved from flat utilities to the `AbiEvent` namespace.

```diff
- import { decodeEventLog, encodeEventTopics, parseAbi } from 'viem'
+ import { Abi, AbiEvent } from 'viem'

- const abi = parseAbi(['event Transfer(address indexed from, address indexed to, uint256 value)'])
- const topics = encodeEventTopics({ abi, eventName: 'Transfer', args: { from } })
- const event = decodeEventLog({ abi, data, topics })
+ const abi = Abi.from(['event Transfer(address indexed from, address indexed to, uint256 value)'])
+ const topics = AbiEvent.encode(abi, 'Transfer', { from })
+ const event = AbiEvent.decodeLog(abi, { data, topics })
```

ABI constructor and error encoding utilities moved from flat utilities to the `AbiConstructor` and `AbiError` namespaces.

```diff
- import { decodeErrorResult, encodeDeployData, encodeErrorResult, parseAbi } from 'viem'
+ import { Abi, AbiConstructor, AbiError } from 'viem'

- const abi = parseAbi(['constructor(address owner)', 'error Unauthorized(address caller)'])
- const deployData = encodeDeployData({ abi, bytecode, args: [owner] })
- const errorData = encodeErrorResult({ abi, errorName: 'Unauthorized', args: [caller] })
- const error = decodeErrorResult({ abi, data: errorData })
+ const abi = Abi.from(['constructor(address owner)', 'error Unauthorized(address caller)'])
+ const deployData = AbiConstructor.encode(abi, { bytecode, args: [owner] })
+ const errorData = AbiError.encode(abi, 'Unauthorized', [caller])
+ const error = AbiError.extract(abi, errorData)
```

ABI parsing and item lookup utilities moved from flat utilities to the `Abi`, `AbiItem`, and `AbiParameters` namespaces.

```diff
- import { getAbiItem, parseAbi, parseAbiItem, parseAbiParameters } from 'viem'
+ import { Abi, AbiItem, AbiParameters } from 'viem'

- const abi = parseAbi(['function transfer(address to, uint256 amount)'])
- const item = parseAbiItem('function transfer(address to, uint256 amount)')
- const parameters = parseAbiParameters('address to, uint256 amount')
- const transfer = getAbiItem({ abi, name: 'transfer' })
+ const abi = Abi.from(['function transfer(address to, uint256 amount)'])
+ const item = AbiItem.from('function transfer(address to, uint256 amount)')
+ const parameters = AbiParameters.from('address to, uint256 amount')
+ const transfer = AbiItem.fromAbi(abi, 'transfer')
```

Solidity integer bounds moved from flat constants to the `Solidity` namespace.

```diff
- import { maxInt256, maxUint256, minInt256 } from 'viem'
+ import { Solidity } from 'viem'

- const max = maxUint256
+ const max = Solidity.maxUint256
```

Event log parsing moved from `parseEventLogs` to `AbiEvent.extractLogs` (same `eventName`/`args`/`strict` semantics, positional abi and logs).

```diff
- import { parseEventLogs } from 'viem'
+ import { AbiEvent } from 'viem'

- const parsed = parseEventLogs({ abi, logs, eventName: 'Transfer', strict: true })
+ const parsed = AbiEvent.extractLogs(abi, logs, { eventName: 'Transfer', strict: true })
```

`prepareEncodeFunctionData` was replaced by `AbiFunction.fromAbi` (selector precomputed) plus `AbiFunction.encodeData`, and `decodeDeployData` moved to `AbiConstructor.decode` (returns the decoded args directly — `undefined` when the constructor has none — and throws on bytecode mismatch).

```diff
- import { decodeDeployData, encodeFunctionData, prepareEncodeFunctionData } from 'viem'
+ import { AbiConstructor, AbiFunction } from 'viem'

- const prepared = prepareEncodeFunctionData({ abi, functionName: 'transfer' })
- const data = encodeFunctionData({ ...prepared, args: [to, amount] })
+ const transfer = AbiFunction.fromAbi(abi, 'transfer')
+ const data = AbiFunction.encodeData(transfer, [to, amount])

- const { args } = decodeDeployData({ abi, bytecode, data })
+ const args = AbiConstructor.decode(abi, { bytecode, data })
```

ABI item and parameter formatting moved to `AbiItem.getSignature` and `AbiParameters.format`; `formatAbiItemWithArgs` and the `includeName` formatting variants were removed.

```diff
- import { formatAbiItem, formatAbiItemWithArgs, formatAbiParams } from 'viem'
+ import { AbiItem, AbiParameters } from 'viem'

- const signature = formatAbiItem(item)
+ const signature = AbiItem.getSignature(item)
- const params = formatAbiParams(item.inputs)
+ const params = AbiParameters.format(item.inputs)
- formatAbiItemWithArgs({ abiItem, args })
+ // Removed; debug rendering is internal to error formatting.
```

ABI item-lookup and log-topic types moved onto their owning namespaces.

```diff
- import type {
-   AbiItemName,
-   ContractErrorName,
-   ContractEventArgsFromTopics,
-   ContractEventName,
-   ContractFunctionName,
-   ExtractAbiItem,
-   ExtractAbiItemForArgs,
-   ExtractAbiItemNames,
-   LogTopic,
- } from 'viem'
+ import type { AbiError, AbiEvent, AbiFunction, AbiItem, Filter } from 'viem'

- type ItemName = AbiItemName<abi>
- type ErrorName = ContractErrorName<abi>
- type EventName = ContractEventName<abi>
- type FunctionName = ContractFunctionName<abi>
- type MutabilityAware = ContractFunctionName<abi, 'view'>
- type Item = ExtractAbiItem<abi, name>
- type ItemForArgs = ExtractAbiItemForArgs<abi, name, args>
- type Names = ExtractAbiItemNames<abi>
- type EventArgs = ContractEventArgsFromTopics<abi, name>
- type Topic = LogTopic
+ type ItemName = AbiItem.Name<abi>
+ type ErrorName = AbiError.Name<abi>
+ type EventName = AbiEvent.Name<abi>
+ type FunctionName = AbiFunction.Name<abi>
+ type MutabilityAware = AbiFunction.ExtractNames<abi, 'view'>
+ type Item = AbiItem.FromAbi<abi, name>
+ type ItemForArgs = AbiItem.fromAbi.ReturnType<abi, name, args>
+ type Names = AbiItem.ExtractNames<abi>
+ type EventArgs = AbiEvent.decode.ReturnType<AbiEvent.FromAbi<abi, name>>
+ type Topic = Filter.Topic
```

`abitype` types are no longer re-exported. Import them from `abitype` directly (a direct dependency of viem), including `AbiParameterKind`, `AbiParameterToPrimitiveType`, `AbiStateMutability`, `ParseAbi`, `ParseAbiItem`, `ParseAbiParameter`, `ResolvedRegister`, and the single-parameter `parseAbiParameter` utility. Type registration via declaration merging on abitype's `Register` continues to work.

```diff
- import { parseAbiParameter, type ParseAbi, type ResolvedRegister } from 'viem'
+ import { parseAbiParameter, type ParseAbi, type ResolvedRegister } from 'abitype'
```

Internal ABI type-plumbing helpers were removed without public replacements: `AbiEventParameterToPrimitiveType`, `AbiEventParametersToPrimitiveTypes`, `AbiEventTopicToPrimitiveType`, `AbiItemArgs`, `ContractConstructorArgs`, `ContractErrorArgs`, `ContractEventArgs`, `ContractFunctionArgs`, `EventDefinition`, `GetEventArgs`, `GetMutabilityAwareValue`, `LogTopicType`, `MaybeAbiEventName`, and `MaybeExtractEventArgsFromAbi`. Compose from `abitype` primitives (e.g. `AbiParametersToPrimitiveTypes<ExtractAbiFunction<abi, name>['inputs']>`) or use the owning function's namespace types (e.g. `AbiEvent.encode.Args`, `AbiEvent.extractLogs.Args`).

Preset ABI constants moved: ERC-20 to `abitype/abis`, the ERC-6492 validator ABI to `SignatureErc6492`, and the ERC-721/ERC-1155/ERC-4626 definitions to the `Abis` namespace.

```diff
- import { erc20Abi, erc721Abi, erc1155Abi, erc4626Abi, erc6492SignatureValidatorAbi } from 'viem'
+ import { erc20Abi } from 'abitype/abis'
+ import { Abis, SignatureErc6492 } from 'viem'

- erc721Abi
+ Abis.erc721
- erc1155Abi
+ Abis.erc1155
- erc4626Abi
+ Abis.erc4626
- erc6492SignatureValidatorAbi
+ SignatureErc6492.universalSignatureValidatorAbi
```

`erc20Abi_bytes32` (bytes32 `name`/`symbol` ERC-20 variant) and `multicall3Abi` were removed. Inline the bytes32 overrides where needed, and build the aggregate3 signature directly for manual multicall reads (`Actions.multicall` handles aggregation internally).

```diff
- import { erc20Abi_bytes32, multicall3Abi } from 'viem'
+ import { AbiFunction } from 'viem'

+ const aggregate3 = AbiFunction.from(
+   'function aggregate3((address target, bool allowFailure, bytes callData)[] calls) payable returns ((bool success, bytes returnData)[] returnData)',
+ )
```

The deployless-call bytecode constants were internalized; deployless calls are first-class `Actions.call` options.

```diff
- import { deploylessCallViaBytecodeBytecode, deploylessCallViaFactoryBytecode } from 'viem'
+ import { Actions } from 'viem'

+ await Actions.call(client, { code, data })
+ await Actions.call(client, { factory, factoryData, to, data })
```
