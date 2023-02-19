# multicall

Similar to [`readContract`](/docs/contract/readContract), but batches up & contracts multiple functions on a contract in a single RPC call via the [`multicall3` contract](https://github.com/mds1/multicall). 

## Usage

::: code-group

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

## Parameters

### contracts.address

- **Type**: `Address`

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

- **Type**: `Abi`

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

### from (optional)

- **Type:** `Address`

Optional sender override.

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
  from: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b' // [!code focus]
})
```
