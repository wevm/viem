# deployContract

Deploys a contract to the network, given bytecode & constructor arguments.

## Usage

::: code-group

```ts [example.ts]
import { wagmiAbi } from './abi'
import { walletClient } from './client'

await walletClient.deployContract({
  abi,
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
import { deployContract } from 'viem/contract'
import { wagmiAbi } from './abi'
import { walletClient } from './client'

await walletClient.deployContract({
  abi,
  args: [69420],
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
})
```

```ts {4} [abi.ts]
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
await walletClient.deployContract({
  abi: wagmiAbi, // [!code focus]
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
})
```

### bytecode

- **Type:** [`Hex`](/docs/glossary/types#TODO)

The contract's bytecode.

```ts
await walletClient.deployContract({
  abi: wagmiAbi,
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...', // [!code focus]
})
```

### args (if required)

- **Type:** Inferred from ABI.

Constructor arguments to call upon deployment.

```ts
await walletClient.deployContract({
  abi: wagmiAbi,
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
  args: [69] // [!code focus]
})
```
