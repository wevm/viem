---
description: Calls a read-only function on a contract, and returns the response.
---

# readContract

Calls a read-only function on a contract, and returns the response.

A "read-only" function (constant function) on a Solidity contract is denoted by a `view` or `pure` keyword. They can only read the state of the contract, and cannot make any changes to it. Since read-only methods do not change the state of the contract, they do not require any gas to be executed, and can be called by any user without the need to pay for gas.

Internally, `readContract` uses a [Public Client](/docs/clients/public) to call the [`call` action](/docs/actions/public/call) with [ABI-encoded `data`](/docs/contract/encodeFunctionData).

## Usage

Below is a very basic example of how to call a read-only function on a contract (with no arguments).

:::code-group

```ts [example.ts]
import { publicClient } from './client'
import { wagmiAbi } from './abi'

const data = await publicClient.readContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'totalSupply',
})
// 69420n
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

### Passing Arguments

If your function requires argument(s), you can pass them through with the `args` attribute.

TypeScript types for `args` will be inferred from the function name & ABI, to guard you from inserting the wrong values.

For example, the `balanceOf` function name below requires an **address** argument, and it is typed as `["0x${string}"]`.

:::code-group

```ts [example.ts] {8}
import { publicClient } from './client'
import { wagmiAbi } from './abi'

const data = await publicClient.readContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'balanceOf',
  args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC']
})
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
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

### Deployless Reads

It is possible to call a function on a contract that has not been deployed yet. For instance, we may want
to call a function on an [ERC-4337 Smart Account](https://eips.ethereum.org/EIPS/eip-4337) contract which has not been deployed.

Viem offers two ways of performing a Deployless Call, via:

- [Bytecode](#bytecode)
- a [Deploy Factory](#deploy-factory): "temporarily deploys" a contract with a provided [Deploy Factory](https://docs.alchemy.com/docs/create2-an-alternative-to-deriving-contract-addresses#create2-contract-factory), and calls the function on the deployed contract.

:::tip
The **Deployless Call** pattern is also accessible via the [Contract Instance](/docs/contract/getContract) API.
:::

#### Bytecode

The example below demonstrates how we can utilize a Deployless Call **via Bytecode** to call the `name` function on the [Wagmi Example ERC721 contract](https://etherscan.io/address/0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2#code) which has not been deployed:

:::code-group

```ts twoslash [example.ts]
import { parseAbi } from 'viem'
import { publicClient } from './config'

const data = await publicClient.readContract({
  abi: parseAbi(['function name() view returns (string)']),
  code: '0x...', // Accessible here: https://etherscan.io/address/0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2#code
  functionName: 'name'
})
```

```ts twoslash [config.ts] filename="config.ts"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

#### Deploy Factory

The example below demonstrates how we can utilize a Deployless Call **via a [Deploy Factory](https://docs.alchemy.com/docs/create2-an-alternative-to-deriving-contract-addresses#create2-contract-factory)** to call the `entryPoint` function on an [ERC-4337 Smart Account](https://eips.ethereum.org/EIPS/eip-4337) which has not been deployed:

:::code-group

```ts twoslash [example.ts]
import { encodeFunctionData, parseAbi } from 'viem'
import { account, publicClient } from './config'

const data = await publicClient.readContract({
  // Address of the Smart Account deployer (factory).
  factory: '0xE8Df82fA4E10e6A12a9Dab552bceA2acd26De9bb',

  // Function to execute on the factory to deploy the Smart Account.
  factoryData: encodeFunctionData({
    abi: parseAbi(['function createAccount(address owner, uint256 salt)']),
    functionName: 'createAccount',
    args: [account, 0n],
  }),

  // Function to call on the Smart Account.
  abi: account.abi,
  address: account.address,
  functionName: 'entryPoint',
})
```

```ts twoslash [config.ts] filename="config.ts"
import { createPublicClient, http, parseAbi } from 'viem'
import { mainnet } from 'viem/chains'

export const account = {
  address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  abi: parseAbi(['function entryPoint() view returns (address)'])
} as const

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

:::note
This example utilizes the [SimpleAccountFactory](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccountFactory.sol).
:::

## Return Value

The response from the contract. Type is inferred.

## Parameters

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The contract address.

```ts
const data = await publicClient.readContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
  abi: wagmiAbi,
  functionName: 'totalSupply',
})
```

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

```ts
const data = await publicClient.readContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi, // [!code focus]
  functionName: 'totalSupply',
})
```

### functionName

- **Type:** `string`

A function to extract from the ABI.

```ts
const data = await publicClient.readContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'totalSupply', // [!code focus]
})
```

### args (optional)

- **Type:** Inferred from ABI.

Arguments to pass to function call.

```ts
const data = await publicClient.readContract({
  address: '0x1dfe7ca09e99d10835bf73044a23b73fc20623df',
  abi: wagmiAbi,
  functionName: 'balanceOf',
  args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'] // [!code focus]
})
```

### account (optional)

- **Type:** `Account | Address`

Optional Account sender override.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const data = await publicClient.readContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'totalSupply',
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `number`

The block number to perform the read against.

```ts
const data = await publicClient.readContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'totalSupply',
  blockNumber: 15121123n, // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to perform the read against.

```ts
const data = await publicClient.readContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'totalSupply',
  blockTag: 'safe', // [!code focus]
})
```

### factory (optional)

- **Type:**

Contract deployment factory address (ie. Create2 factory, Smart Account factory, etc).

```ts twoslash
const data = await publicClient.readContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'totalSupply',
  factory: '0x0000000000ffe8b47b3e2130213b802212439497', // [!code focus]
  factoryData: '0xdeadbeef',
})
```

### factoryData (optional)

- **Type:**

Calldata to execute on the factory to deploy the contract.

```ts twoslash
const data = await publicClient.readContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'totalSupply',
  factory: '0x0000000000ffe8b47b3e2130213b802212439497',
  factoryData: '0xdeadbeef', // [!code focus]
})
```

### stateOverride (optional)

- **Type:** [`StateOverride`](/docs/glossary/types#stateoverride)

The state override set is an optional address-to-state mapping, where each entry specifies some state to be ephemerally overridden prior to executing the call.

```ts
const data = await publicClient.readContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'totalSupply',
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

Check out the usage of `readContract` in the live [Reading Contracts Example](https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts_reading-contracts) below.

<iframe frameBorder="0" width="100%" height="500px" src="https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts_reading-contracts?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>
