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
// @twoslash-cache: {"v":1,"hash":"a1a74355b21338805085eddc2d85a2170ab9ffc24ce41bfd8db90eb2571ae10b","data":"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"}
import { parseAbi } from 'viem'
import { publicClient } from './config'

const data = await publicClient.readContract({
  abi: parseAbi(['function name() view returns (string)']),
  code: '0x...', // Accessible here: https://etherscan.io/address/0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2#code
  functionName: 'name'
})
```

```ts twoslash [config.ts] filename="config.ts"
// @twoslash-cache: {"v":1,"hash":"b71f5992ca6f10e6adae78058cfebc0188b58c7ebd0625d5c6c5c27648cad1ae","data":"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"}
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
// @twoslash-cache: {"v":1,"hash":"99b59323da57aeabd412edec146301a2c107bf11a139cb24c4ff6e9b05c95cdd","data":"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"}
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
// @twoslash-cache: {"v":1,"hash":"eed73b030872a7a28363a7080a4a2f2d120e7ccf6ca82434fdc5068ab8c6d59d","data":"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"}
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

```ts
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

```ts
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
