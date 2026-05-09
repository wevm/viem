---
description: A Contract Instance is a type-safe interface for performing contract-related actions with a specific ABI and address, created by the getContract function.
---

# Contract Instances

A Contract Instance is a type-safe interface for performing contract-related actions with a specific ABI and address, created by the `getContract` function.

## Import

```ts
import { getContract } from 'viem'
```

## Usage

You can create a Contract Instance with the `getContract` function by passing in a [ABI](/docs/glossary/types#abi), address, and [Public](/docs/clients/public) and/or [Wallet Client](/docs/clients/wallet). Once created, you can call contract methods, fetch for events, listen to events, etc.

:::code-group

```ts [example.ts]
import { getContract } from 'viem'
import { wagmiAbi } from './abi'
import { publicClient, walletClient } from './client'

// 1. Create contract instance
const contract = getContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  // 1a. Insert a single client
  client: publicClient,
  // 1b. Or public and/or wallet clients
  client: { public: publicClient, wallet: walletClient }
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
import { createPublicClient, createWalletClient, http, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { EthereumProvider } from '@walletconnect/ethereum-provider'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

// eg: Metamask
export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
})

// eg: WalletConnect
const provider = await EthereumProvider.init({
  projectId: "abcd1234",
  showQrModal: true,
  chains: [1],
})

export const walletClientWC = createWalletClient({
  chain: mainnet,
  transport: custom(provider),
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

Using Contract Instances can make it easier to work with contracts if you don't want to pass the `abi` and `address` properties every time you perform contract actions, e.g. [`readContract`](/docs/contract/readContract), [`writeContract`](/docs/contract/writeContract), [`estimateContractGas`](/docs/contract/estimateContractGas), etc. Switch between the tabs below to see the difference between standalone Contract Actions and Contract Instance Actions:

:::code-group

```ts [contract-instance.ts]
import { getContract } from 'viem'
import { wagmiAbi } from './abi'
import { publicClient, walletClient } from './client'

const contract = getContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  client: {
    public: publicClient,
    wallet: walletClient,
  }
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

:::

:::tip
While Contract Instances are great for reducing code duplication, they pull in multiple contract actions (e.g. `createContractEventFilter`, `estimateContractGas`, `readContract`, `simulateContract`, `watchContractEvent`, `writeContract`), so they can be a bit heavier than individual calls. If you only need a couple contract methods and you care about minimizing bundle size to the fullest extent, you may want to use individual calls instead.
:::

## Return Value

Contract instance object. Type is inferred.

Depending on if you create a contract instance with a Public Client, Wallet Client, or both, the methods available on the contract instance will vary.

#### With Public Client

If you pass in a [`publicClient`](https://viem.sh/docs/clients/public), the following methods are available:

- [`createEventFilter`](/docs/contract/createContractEventFilter)
- [`estimateGas`](/docs/contract/estimateContractGas)
- [`getEvents`](/docs/contract/getContractEvents)
- [`read`](/docs/contract/readContract)
- [`simulate`](/docs/contract/simulateContract)
- [`watchEvent`](/docs/contract/watchContractEvent)

#### With Wallet Client

If you pass in a [`walletClient`](/docs/clients/wallet), the following methods are available:

- [`estimateGas`](/docs/contract/estimateContractGas)
- [`write`](/docs/contract/writeContract)

#### Calling methods

If you are using [TypeScript](/docs/typescript) with viem, your editor will be able to provide autocomplete suggestions for the methods available on the contract instance, as well as the arguments and other options for each method.

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
  client: publicClient
})
```

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

```ts
const contract = getContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi, // [!code focus]
  client: publicClient
})
```

### client

- **Type:** [`Client | { public: Client; wallet: Client }`](/docs/clients/public)

The Client used for performing [contract actions](/docs/contract/getContract#return-value).

```ts
const contract = getContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  client: publicClient, // [!code focus]
})
```

You can also pass in multiple clients (ie. a Wallet Client and a Public Client):

```ts
const contract = getContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  client: { // [!code focus]
    public: publicClient, // [!code focus]
    wallet: walletClient // [!code focus]
  }, // [!code focus]
})
```
