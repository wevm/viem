---
head:
  - - meta
    - property: og:title
      content: Contract Instances
  - - meta
    - name: description
      content: A Contract Instance is a type-safe interface for performing contract-related actions with specific ABI and address, created by the `getContract` function.
  - - meta
    - property: og:description
      content: A Contract Instance is a type-safe interface for performing contract-related actions with a specific ABI and address, created by the `getContract` function.

---

# Contract Instances

A Contract Instance is a type-safe interface for performing contract-related actions with a specific ABI and address, created by the `getContract` function.

## Import

```ts
import { getContract } from 'viem'
```

## Usage

You can create a Contract Instance with the `getContract` function by passing in a [ABI](/docs/glossary/types.html#abi), address, and [Public](/docs/clients/public.html) and/or [Wallet Client](/docs/clients/wallet.html). Once created, you can call contract methods, fetch for events, listen to events, etc.

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

// 2. Call contract methods, fetch events, listen to events, etc.
const result = await contract.read.totalSupply()
const logs = await contract.getEvents.Transfer()
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

Using Contract Instances can make it easier to work with contracts if you don't want to pass the `abi` and `address` properties every time you perform contract actions, e.g. [`readContract`](/docs/contract/readContract.html), [`writeContract`](/docs/contract/writeContract.html), [`estimateContractGas`](/docs/contract/estimateContractGas.html), etc. Switch between the tabs below to see the difference between standalone Contract Actions and Contract Instance Actions:

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
const unwatch = publicClient.watchContractEvent({
  address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
  abi: wagmiAbi,
  eventName: 'Transfer',
  args: {  
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  },
  onLogs: logs => console.log(logs)
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
const hash = await contract.write.mint([69420])
const logs = await contract.getEvents.Transfer()
const unwatch = contract.watchEvent.Transfer(
  {
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  },
  { onLogs: logs => console.log(logs) }
)
```

:::

::: tip
While Contract Instances are great for reducing code duplication, they pull in multiple contract actions (e.g. `createContractEventFilter`, `estimateContractGas`, `readContract`, `simulateContract`, `watchContractEvent`, `writeContract`), so they can be a bit heavier than individual calls. If you only need a couple contract methods and you care about minimizing bundle size to the fullest extent, you may want to use individual calls instead.
:::

## Return Value

Contract instance object. Type is inferred.

Depending on if you create a contract instance with a Public Client, Wallet Client, or both, the methods available on the contract instance will vary.

#### With Public Client

If you pass in a [`publicClient`](https://viem.sh/docs/clients/public.html), the following methods are available:

- [`createEventFilter`](/docs/contract/createContractEventFilter.html)
- [`estimateGas`](/docs/contract/estimateContractGas.html)
- [`getEvents`](/docs/contract/getContractEvents.html)
- [`read`](/docs/contract/readContract.html)
- [`simulate`](/docs/contract/simulateContract.html)
- [`watchEvent`](/docs/contract/watchContractEvent.html)

#### With Wallet Client

If you pass in a [`walletClient`](/docs/clients/wallet.html), the following methods are available:

- [`estimateGas`](/docs/contract/estimateContractGas.html)
- [`write`](/docs/contract/writeContract.html)

#### Calling methods

If you are using [TypeScript](/docs/typescript.html) with viem, your editor will be able to provide autocomplete suggestions for the methods available on the contract instance, as well as the arguments and other options for each method.

In general, contract instance methods follow the following format:

```ts
// function
contract.(estimateGas|read|simulate|write).(functionName)(args, options)

// event
contract.(createEventFilter|getEvents|watchEvent).(eventName)(args, options)
```

If the contract function/event you are using does not accept arguments (e.g. function has no inputs, event has no indexed inputs), then you can omit the `args` parameter so `options` is the first and only parameter.

## Parameters

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The contract address.

```ts
const contract = getContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
  abi: wagmiAbi,
  publicClient,
  walletClient,
})
```

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

```ts
const contract = getContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi, // [!code focus]
  publicClient,
  walletClient,
})
```

### publicClient (optional)

- **Type:** [`PublicClient`](/docs/clients/public.html)

Public Client used for performing [public contract actions](/docs/contract/getContract.html#with-public-client).

```ts
const contract = getContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  publicClient, // [!code focus]
  walletClient,
})
```

### walletClient (optional)

- **Type:** [`WalletClient`](/docs/clients/wallet.html)

Wallet Client used for performing [wallet contract actions](/docs/contract/getContract.html#with-wallet-client).

```ts
const contract = getContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  publicClient,
  walletClient, // [!code focus]
})
```
