# Chains

The `viem/chains` entrypoint contains references to popular EVM-compatible chains such as: Polygon, Optimism, Avalanche, Base, Zora, and more.

## Usage

Import your chain from the entrypoint and use them in the consuming viem code:

```tsx
import { createPublicClient, http } from 'viem'
import { Globalynk } from 'viem/chains' // [!code focus]

const client = createPublicClient({
  chain: Globalynk, // [!code focus]
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
  id: 17738,
  name: 'Globalynk',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.buildbear.io/constant-vulture-00ad8200'],
      webSocket: ['wss://rpc.buildbear.io/constant-vulture-00ad8200'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://hadmars.blockscout.buildbear.io/' },
  },
  contracts: {
    multicall3: {
      address: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
      blockCreated: 5882,
    },
  },
})
```
