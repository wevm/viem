# call [An Action for executing a new message call.]

Executes a new message call immediately without submitting a transaction to the network.

## Usage

:::code-group

```ts twoslash [example.ts]
import { account, publicClient } from './config'

const data = await publicClient.call({ // [!code focus:7]
  account,
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

```ts twoslash [config.ts] filename="config.ts"
import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

// @log: ↓ JSON-RPC Account
export const account = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'

// @log: ↓ Local Account
// export const account = privateKeyToAccount(...)

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

### Deployless Calls

It is possible to call a function on a contract that has not been deployed yet. For instance, we may want
to call a function on an [ERC-4337 Smart Account](https://eips.ethereum.org/EIPS/eip-4337) contract which has not been deployed.

Viem offers two ways of performing a Deployless Call, via:

- [Bytecode](#bytecode)
- a [Deploy Factory](#deploy-factory): "temporarily deploys" a contract with a provided [Deploy Factory](https://docs.alchemy.com/docs/create2-an-alternative-to-deriving-contract-addresses#create2-contract-factory), and calls the function on the deployed contract.

:::tip
The **Deployless Call** pattern is also accessible via the [`readContract`](/docs/contract/readContract#deployless-reads) & [Contract Instance](/docs/contract/getContract) APIs.
:::

#### Bytecode

The example below demonstrates how we can utilize a Deployless Call **via Bytecode** to call the `name` function on the [Wagmi Example ERC721 contract](https://etherscan.io/address/0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2#code) which has not been deployed:

:::code-group

```ts twoslash [example.ts]
import { encodeFunctionData, parseAbi } from 'viem'
import { publicClient } from './config'

const data = await publicClient.call({
  // Bytecode of the contract. Accessible here: https://etherscan.io/address/0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2#code
  code: '0x...',
  // Function to call on the contract.
  data: encodeFunctionData({
    abi: parseAbi(['function name() view returns (string)']),
    functionName: 'name'
  }),
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
import { owner, publicClient } from './config'

const data = await publicClient.call({
  // Address of the contract deployer (e.g. Smart Account Factory).
  factory: '0xE8Df82fA4E10e6A12a9Dab552bceA2acd26De9bb',

  // Function to execute on the factory to deploy the contract.
  factoryData: encodeFunctionData({
    abi: parseAbi(['function createAccount(address owner, uint256 salt)']),
    functionName: 'createAccount',
    args: [owner, 0n],
  }),

  // Function to call on the contract (e.g. Smart Account contract).
  data: encodeFunctionData({
    abi: parseAbi(['function entryPoint() view returns (address)']),
    functionName: 'entryPoint'
  }),

  // Address of the contract.
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

```ts twoslash [config.ts] filename="config.ts"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const owner = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

:::note
This example utilizes the [SimpleAccountFactory](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccountFactory.sol).
:::

## Returns

`0x${string}`

The call data.

## Parameters

### account

- **Type:** `Account | Address`

The Account to call from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const data = await publicClient.call({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### data

- **Type:** `0x${string}`

A contract hashed method call with encoded args.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const data = await publicClient.call({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### to

- **Type:** [`Address`](/docs/glossary/types#address)

The contract address or recipient.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const data = await publicClient.call({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
})
```

### accessList (optional)

- **Type:** [`AccessList`](/docs/glossary/types#accesslist)

The access list.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const data = await publicClient.call({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  accessList: [ // [!code focus:6]
    {
      address: '0x1',
      storageKeys: ['0x1'],
    },
  ],
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### blockNumber (optional)

- **Type:** `number`

The block number to perform the call against.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const data = await publicClient.call({
  blockNumber: 15121123n, // [!code focus]
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to perform the call against.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const data = await publicClient.call({
  blockTag: 'safe', // [!code focus]
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### code (optional)

- **Type:**

Bytecode to perform the call against.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const data = await publicClient.call({
  code: '0x...', // [!code focus]
  data: '0xdeadbeef',
})
```

### factory (optional)

- **Type:**

Contract deployment factory address (ie. Create2 factory, Smart Account factory, etc).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const data = await publicClient.call({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  factory: '0x0000000000ffe8b47b3e2130213b802212439497', // [!code focus]
  factoryData: '0xdeadbeef',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### factoryData (optional)

- **Type:**

Calldata to execute on the factory to deploy the contract.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const data = await publicClient.call({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  factory: '0x0000000000ffe8b47b3e2130213b802212439497',
  factoryData: '0xdeadbeef', // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### gas (optional)

- **Type:** `bigint`

The gas provided for transaction execution.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const data = await publicClient.call({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  gas: 1_000_000n, // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas. Only applies to [Legacy Transactions](/docs/glossary/terms#legacy-transaction).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseGwei } from 'viem'

const data = await publicClient.call({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  gasPrice: parseGwei('20'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseGwei } from 'viem'

const data = await publicClient.call({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  maxFeePerGas: parseGwei('20'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseGwei } from 'viem'

const data = await publicClient.call({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### nonce (optional)

- **Type:** `bigint`

Unique number identifying this transaction.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const data = await publicClient.call({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  nonce: 420, // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### stateOverride (optional)

- **Type:** [`StateOverride`](/docs/glossary/types#stateoverride)

The state override set is an optional address-to-state mapping, where each entry specifies some state to be ephemerally overridden prior to executing the call.

```ts
const data = await publicClient.call({
  account,
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
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

### value (optional)

- **Type:** `bigint`

Value (in wei) sent with this transaction.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseEther } from 'viem'

const data = await publicClient.call({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1'), // [!code focus]
})
```

## JSON-RPC Methods

[`eth_call`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call)
