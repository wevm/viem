# deployContract

Deploys a contract to the network, given bytecode & constructor arguments.

## Install

```ts
import { deployContract } from 'viem'
```

## Usage

::: code-group

```ts [example.ts]
import { deployContract } from 'viem'
import { wagmiAbi } from './abi'
import { walletClient } from './client'

await deployContract(walletClient, {
  abi,
  bytecode: '608060405260405161083e38038061083e833981016040819052610...',
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

```ts [client.ts]
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})
```

:::

### Deploying with Constructor Args

::: code-group

```ts {7} [example.ts]
import { deployContract } from 'viem'
import { wagmiAbi } from './abi'
import { walletClient } from './client'

await deployContract(walletClient, {
  abi,
  args: [69420],
  bytecode: '608060405260405161083e38038061083e833981016040819052610...',
})
```

```ts {4} [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [{ internalType: "uint32", name: "x", type: "uint32" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  ...
] as const;
```

```ts [client.ts]
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})
```

:::

### Deploying with CREATE2

Unlike normal contract deployments (a la `CREATE`), the `CREATE2` EVM opcode is a feature that allows for the creation of smart contracts with a predetermined address.

You can derive a predetermined address using [`getContractAddress`](/docs/utilities/getContractAddress), and deploy it with the snippet below.

::: code-group

```ts [example.ts]
import { deployContract } from 'viem'
import { wagmiAbi } from './abi'
import { walletClient } from './client'

const address = getContractAddress({
  bytecode: '608060405260405161083e38038061083e833981016040819052610...',
  from: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b',
  opcode: 'CREATE2',
  salt: 'hello',
})

await deployContract(walletClient, {
  abi,
  bytecode: '608060405260405161083e38038061083e833981016040819052610...',
  salt: 'hello',
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

```ts [client.ts]
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})
```

:::

## Parameters

### abi

- **Type:** [`Abi`](/docs/glossary/types#TODO)

The contract's ABI.

```ts
await deployContract(walletClient, {
  abi: wagmiAbi, // [!code focus]
  bytecode: '608060405260405161083e38038061083e833981016040819052610...',
})
```

### bytecode

- **Type:** [`Hex`](/docs/glossary/types#TODO)

The contract's bytecode.

```ts
await deployContract(walletClient, {
  abi: wagmiAbi,
  bytecode: '608060405260405161083e38038061083e833981016040819052610...', // [!code focus]
})
```

### args (if required)

- **Type:** Inferred from ABI.

Constructor arguments to call upon deployment.

```ts
await deployContract(walletClient, {
  abi: wagmiAbi,
  bytecode: '608060405260405161083e38038061083e833981016040819052610...',
  args: [69] // [!code focus]
})
```

### salt (optional)

- **Type:** `string`

An arbitrary value provided by the sender for `CREATE2` deployments.

```ts
await deployContract(walletClient, {
  abi: wagmiAbi,
  bytecode: '608060405260405161083e38038061083e833981016040819052610...',
  salt: 'hello' // [!code focus]
})
```