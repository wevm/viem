# Chains

The `viem/chains` entrypoint contains references to popular EVM-compatible chains such as: Polygon, Optimism, Avalanche, Base, Zora, and more.

## Usage

Import your chain from the entrypoint and use them in the consuming viem code:

```tsx
import { createPublicClient, http } from 'viem'
import { zora } from 'viem/chains' // [!code focus]

const client = createPublicClient({
  chain: zora, // [!code focus]
  transport: http()
})
```

[See here for a list of supported chains](https://github.com/wagmi-dev/viem/tree/main/src/chains/index.ts).

> Want to add a chain that's not listed in viem? Read the [Contributing Guide](https://github.com/wagmi-dev/viem/blob/main/.github/CONTRIBUTING.md#chains), and then open a Pull Request with your chain.

## Custom Chains

You can also extend viem to support other EVM-compatible chains by building your own chain object that inherits the `Chain` type.

```ts
import { defineChain } from 'viem'

export const zora = defineChain({
  id: 7777777,
  name: 'Zora',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.zora.energy'],
      webSocket: ['wss://rpc.zora.energy'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.zora.energy' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 5882,
    },
  },
})
```