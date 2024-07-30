# multicall [Batches up multiple functions on a contract in a single call.]

Similar to [`readContract`](/docs/contract/readContract), but batches up multiple functions on a contract in a single RPC call via the [`multicall3` contract](https://github.com/mds1/multicall). 

## Usage

:::code-group

```ts [example.ts]
import { publicClient } from './client'
import { wagmiAbi } from './abi'

const wagmiContract = {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi
} as const

const results = await publicClient.multicall({
  contracts: [
    {
      ...wagmiContract,
      functionName: 'totalSupply',
    },
    {
      ...wagmiContract,
      functionName: 'ownerOf',
      args: [69420n]
    },
    {
      ...wagmiContract,
      functionName: 'mint'
    }
  ]
})
/**
 * [
 *  { result: 424122n, status: 'success' },
 *  { result: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b', status: 'success' },
 *  { error: [ContractFunctionExecutionError: ...], status: 'failure' }
 * ]
 */
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "mint",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  ...
] as const;
```

```ts [client.ts]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

## Return Value

`({ data: <inferred>, status: 'success' } | { error: string, status: 'reverted' })[]`

An array of results with accompanying status.

Additionally, when [`allowFailure`](#allowfailure-optional) is set to `false`, it directly returns an array of inferred data:

`(<inferred>)[]`

## Parameters

### contracts.address

- **Type:** [`Address`](/docs/glossary/types#address)

The contract address.

```ts
const results = await publicClient.multicall({
  contracts: [
    {
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
      abi: wagmiAbi,
      functionName: 'totalSupply',
    },
    ...
  ]
})
```

### contracts.abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract ABI.

```ts
const results = await publicClient.multicall({
  contracts: [
    {
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi: wagmiAbi, // [!code focus]
      functionName: 'totalSupply',
    },
    ...
  ]
})
```

### contracts.functionName

- **Type**: `string`

The function name to call.

```ts
const results = await publicClient.multicall({
  contracts: [
    {
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi: wagmiAbi,
      functionName: 'totalSupply', // [!code focus]
    },
    ...
  ]
})
```

### contracts.args (optional)

- **Type:** Inferred from ABI.

Arguments to pass to function call.

```ts
const results = await publicClient.multicall({
  contracts: [
    {
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi: wagmiAbi,
      functionName: 'balanceOf',
      args: ['0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b'] // [!code focus]
    },
    ...
  ]
})
```

### allowFailure (optional)

- **Type:** `boolean`
- **Default:** `true`

Whether or not the `multicall` function should throw if a call reverts. If set to `true` (default), and a call reverts, then `multicall` will fail silently and its error will be logged in the `results` array.

```ts
const results = await publicClient.multicall({
  contracts: [
    {
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi: wagmiAbi,
      functionName: 'totalSupply',
    },
    ...
  ],
  allowFailure: false // [!code focus]
})
```

### batchSize (optional)

- **Type:** `number`
- **Default:** [`client.batch.multicall.batchSize`](/docs/clients/public#batch-multicall-batchsize-optional) (if set) or `1024`

The maximum size (in bytes) for each calldata chunk. Set to `0` to disable the size limit.

> Note: Some RPC Providers limit the amount of calldata (`data`) that can be sent in a single `eth_call` request. It is best to check with your RPC Provider to see if there are any calldata size limits to `eth_call` requests.

```ts
const results = await publicClient.multicall({
  contracts: [
    {
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi: wagmiAbi,
      functionName: 'totalSupply',
    },
    ...
  ],
  batchSize: 4096 // 4kB // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `number`

The block number to perform the read against.

```ts
const results = await publicClient.multicall({
  contracts: [
    {
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi: wagmiAbi,
      functionName: 'totalSupply',
    },
    ...
  ],
  blockNumber: 15121123n, // [!code focus]
})
```

### multicallAddress (optional)

- **Type:** [`Address`](/docs/glossary/types#address)
- **Default:** `client.chain.contracts.multicall3.address`

Address of Multicall Contract.

```ts
const results = await publicClient.multicall({
  contracts: [
    {
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi: wagmiAbi,
      functionName: 'totalSupply',
    },
    ...
  ],
  multicallAddress: '0xca11bde05977b3631167028862be2a173976ca11' // [!code focus]
})
```

### stateOverride (optional)

- **Type:** [`StateOverride`](/docs/glossary/types#stateoverride)

The state override set is an optional address-to-state mapping, where each entry specifies some state to be ephemerally overridden prior to executing the call.

```ts
const data = await publicClient.multicall({
  contracts: [
    {
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi: wagmiAbi,
      functionName: 'totalSupply',
    },
    ...
  ],
  stateOverride: [ // [!code focus]
    { // [!code focus]
      address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', // [!code focus]
      balance: parseEther('1'), // [!code focus]
      stateDiff: [ // [!code focus]
        { // [!code focus]
          slot: '0x3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0', // [!code focus]
          value: '0x00000000000000000000000000000000000000000000000000000000000001a4', // [!code focus]
        }, // [!code focus]
      ], // [!code focus]
    } // [!code focus]
  ], // [!code focus]
})
```

## Live Example

Check out the usage of `multicall` in the live [Multicall Example](https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts_multicall) below.

<iframe frameBorder="0" width="100%" height="500px" src="https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts_multicall?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>
