---
description: Deploys a contract to the network, given bytecode & constructor arguments by using EIP712 transaction.
---

# deployContract

Deploys a contract to the network, given bytecode & constructor arguments by using EIP712 transaction.

## Usage

:::code-group

```ts [example.ts]
import { wagmiAbi } from './abi'
import { account, walletClient } from './config'

const hash = await walletClient.deployContract({
  abi,
  account,
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
})
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  ...
] as const;
```

```ts [config.ts]
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { zksync } from 'viem/chains'
import { eip712Actions } from 'viem/zksync'

export const walletClient = createWalletClient({
  chain: zksync,
  transport: custom(window.ethereum)
}).extend(eip712WalletActions())

// JSON-RPC Account
export const [account] = await walletClient.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::

### Deploying with Constructor Args

:::code-group

```ts [example.ts] {8}
import { deployContract } from 'viem'
import { wagmiAbi } from './abi'
import { account, walletClient } from './config'

const hash = await walletClient.deployContract({
  abi,
  account,
  args: [69420],
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
})
```

```ts [abi.ts] {4}
export const wagmiAbi = [
  ...
  {
    inputs: [{ name: "x", type: "uint32" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  ...
] as const;
```

```ts [config.ts]
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { zksync } from 'viem/chains'
import { eip712Actions } from 'viem/zksync'

export const walletClient = createWalletClient({
  chain: zksync,
  transport: custom(window.ethereum)
}).extend(eip712WalletActions())

// JSON-RPC Account
export const [account] = await walletClient.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::

### Deploying with Factory Deps

:::code-group

```ts [example.ts] {8}
import { deployContract } from 'viem'
import { wagmiAbi } from './abi'
import { account, walletClient } from './config'

const hash = await walletClient.deployContract({
  abi,
  account,
  args: [69420],
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
  factoryDeps: [
    '0x702040405260405161083e38038061083e833981016040819123456...', 
    '0x102030405260405161083e38038061083e833981016040819112233...'
  ]
})
```

```ts [abi.ts] {4}
export const wagmiAbi = [
  ...
  {
    inputs: [{ name: "x", type: "uint32" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  ...
] as const;
```

```ts [config.ts]
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { zksync } from 'viem/chains'
import { eip712Actions } from 'viem/zksync'

export const walletClient = createWalletClient({
  chain: zksync,
  transport: custom(window.ethereum)
}).extend(eip712WalletActions())

// JSON-RPC Account
export const [account] = await walletClient.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::

## Returns

[`Hash`](/docs/glossary/types#hash)

The [Transaction](/docs/glossary/terms#transaction) hash.

## Parameters

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

```ts
const hash = await walletClient.deployContract({
  abi: wagmiAbi, // [!code focus]
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
})
```

### account

- **Type:** `Account | Address`

The Account to deploy the contract from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const hash = await walletClient.deployContract({
  abi: wagmiAbi, 
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
})
```

### bytecode

- **Type:** [`Hex`](/docs/glossary/types#hex)

The contract's bytecode.

```ts
const hash = await walletClient.deployContract({
  abi: wagmiAbi,
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...', // [!code focus]
})
```

### args

- **Type:** Inferred from ABI.

Constructor arguments to call upon deployment.

```ts
const hash = await walletClient.deployContract({
  abi: wagmiAbi,
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
  args: [69] // [!code focus]
})
```

### deploymentType (optional)

- **Type:** `'create' | 'create2' | 'createAccount' | 'create2Account'`

Specifies the type of contract deployment. Defaults to 'create'.

```ts
const hash = await walletClient.deployContract({
  abi: wagmiAbi,
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
  args: [69],
  deploymentType: 'create2' // [!code focus]
})
```

### salt (optional)

- **Type:** [`Hash`](/docs/glossary/types#hash)

Specifies a unique identifier for the contract deployment.


```ts
const hash = await walletClient.deployContract({
  abi: wagmiAbi,
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
  args: [69],
  salt: '0x201050...' // [!code focus]
})
```

### gasPerPubdata (optional)

- **Type:** `bigint`

The amount of gas for publishing one byte of data on Ethereum.

```ts
const hash = await walletClient.sendTransaction({
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  gasPerPubdata: 50000, // [!code focus]
  nonce: 69,
  value: 1000000000000000000n
})
```

### paymaster (optional)

- **Type:** `Account | Address`

Address of the paymaster account that will pay the fees. The `paymasterInput` field is required with this one.

```ts
const hash = await walletClient.sendTransaction({
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021', // [!code focus]
  paymasterInput: '0x8c5a...' // [!code focus]
  nonce: 69,
  value: 1000000000000000000n
})
```

### paymasterInput (optional)

- **Type:** `0x${string}`

Input data to the paymaster. The `paymaster` field is required with this one.

```ts
const hash = await walletClient.sendTransaction({
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021', // [!code focus]
  paymasterInput: '0x8c5a...' // [!code focus]
  nonce: 69,
  value: 1000000000000000000n
})
```
