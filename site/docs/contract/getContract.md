---
head:
  - - meta
    - property: og:title
      content: Contract Instances
  - - meta
    - name: description
      content: Returns type-safe contract instance.
  - - meta
    - property: og:description
      content: Returns type-safe contract instance.

---

# Contract Instances

A Contract Instance is a type-safe interface for performing contract-related actions with a specific ABI and address.

## Usage

You can create a Contract Instance with the `getContract` function. Once created, you can call contract methods, listen to events, etc.

::: code-group
```ts [example.ts]
import { getContract } from 'viem'
import { wagmiAbi } from './abi'
import { publicClient } from './client'

// 1. Create contract instance
const contract = getContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  publicClient,
})
// 2. Call contract methods, listen to events, etc.
const result = await contract.read.totalSupply()
const unwatch = contract.watchEvent.Transfer(
  { from: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e' },
  { onLogs(logs) { console.log(logs) } }
)
```
```ts [client.ts]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})
```
```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'Transfer',
    type: 'event',
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      { indexed: true, name: 'to', type: 'address' },
      {
        indexed: true,
        name: 'tokenId',
        type: 'uint256',
      },
    ],
  },
  ...
] as const;
```
:::

Creates a type-safe interface for performing contract-related actions.

Gets type-safe contract instance.

- Type-safety and inference
- WalletClient/PublicClient actions enabled/disabled