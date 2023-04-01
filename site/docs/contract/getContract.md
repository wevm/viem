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

A Contract Instance is a type-safe interface for performing contract-related actions with a specific ABI and address, created by the `getContract` function.

## Import

```ts
import { getContract } from 'viem'
```

## Usage

You can create a Contract Instance with the `getContract` function by passing in a [ABI](/docs/glossary/types.html#abi), address, and [Public](/docs/clients/public.html) and/or [Wallet Client](/docs/clients/wallet.html). Once created, you can call contract methods, listen to events, etc.

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

Using Contract Instances can make it easier to work with contracts if you don't want to pass the `abi` and `address` properites every time you perform contract actions, e.g. [`readContract`](/docs/contract/readContract.html), [`writeContract`](/docs/contract/writeContract.html), [`estimateContractGas`](/docs/contract/estimateContractGas.html), etc. For example, you can convert the following individual calls:

::: code-group
```ts [contract-actions.ts]
import { wagmiAbi } from './abi'
import { publicClient, walletClient } from './client'

const balance = await publicClient.readContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'balanceOf',
  args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC']
})
const hash = await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420]
})
const filter = await publicClient.createContractEventFilter({
  address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
  abi: wagmiAbi,
  eventName: 'Transfer',
  args: {  
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  }
})
```
```ts [contract-instance.ts]
import { getContract } from 'viem'
import { wagmiAbi } from './abi'
import { publicClient, walletClient } from './client'

const contract = getContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  publicClient,
  walletClient,
})

const balance = await contract.read.balanceOf([
  '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
])
const hash = await contract.write.transferFrom([69420])
const filter = await contract.createEventFilter.Transfer({
  from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
})
```
:::

::: tip
While Contract Instances are great for reducing code duplication, they pull in multiple contract actions (e.g. `createContractEventFilter`, `estimateContractGas`, `readContract`, `simulateContract`, `watchContractEvent`, `writeContract`), so they can be a bit heavier than individual calls. If you only need a couple contract methods and you care about minimizing bundle size to the fullest extent, you may want to use individual calls instead.
:::

## Return Value

Contract instance object. Type is inferred.

If you pass in a [`publicClient`](/docs/contract/getContract#publicclient), the following methods are available:

- [`read`](/docs/contract/readContract.html)
- [`estimateGas`](/docs/contract/estimateContractGas.html)
- [`simulate`](/docs/contract/simulateContract.html)
- [`createEventFilter`](/docs/contract/createContractEventFilter.html)
- [`watchEvent`](/docs/contract/watchContractEvent.html)

If you pass in a [`walletClient`](/docs/contract/getContract#walletclient), the following methods are available:

- [`write`](/docs/contract/writeContract.html)

## Parameters

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The contract address.

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

### publicClient

- **Type:**

### walletClient

- **Type:**