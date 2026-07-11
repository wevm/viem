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

Preset ABI constants were removed, except ERC-20 and ERC-6492 definitions now owned by dependencies.

```diff
- import { erc20Abi, erc6492SignatureValidatorAbi } from 'viem'
+ import { erc20Abi } from 'abitype/abis'
+ import { SignatureErc6492 } from 'viem'

- erc6492SignatureValidatorAbi
+ SignatureErc6492.universalSignatureValidatorAbi
```
