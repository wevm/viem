---
head:
  - - meta
    - property: og:title
      content: Chains
  - - meta
    - name: description
      content: A list of chains to use with viem.
  - - meta
    - property: og:description
      content: A list of chains to use with viem.

---

# Chains

The `viem/chains` entrypoint proxies the [`@wagmi/chains` NPM package](https://npm.im/@wagmi/chains), an official wagmi package which contains references to popular EVM-compatible chains such as: Polygon, Optimism, Avalanche, Base, Zora, and more.

## Usage

Import your chain from the entrypoint and use them in the consuming viem code:

```tsx {2,5}
import { createPublicClient, http } from 'viem'
import { zora } from 'viem/chains'

const client = createPublicClient({
  chain: zora,
  transport: http()
})
```

[See here for a list of supported chains](https://github.com/wagmi-dev/references/tree/main/packages/chains/src).

## Custom Chains

You can also extend wagmi to support other EVM-compatible chains by building your own chain object that inherits the `Chain` type.

```ts
import { defineChain } from 'viem'

export const base = defineChain({
  id: 7777777,
  name: 'Zora',
  network: 'zora',
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
    public: {
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

## Chain Configuration

You can optionally pass a second parameter to `defineChain` to set configuration such as: fees, formatters, and transaction serializers.

### Fees

You can modify how fees are derived by using the `fees` property on the Chain.

#### `fees.baseFeeMultiplier`

- **Type**: `number`
- **Default**: `1.2`

The fee multiplier to use to account for fee fluctuations. Used in the [`estimateFeesPerGas` Action](/docs/actions/public/estimateFeesPerGas) against the latest block's base fee per gas to derive a final `maxFeePerGas` (EIP-1193), or gas price to derive a final `gasPrice` (Legacy).

**Parameters**

- `block`: The latest block.
- `client`: The Client instance.
- `request`: The transaction request (if exists).

```ts
import { defineChain } from 'viem'

const zora = defineChain(
  { /* ... */ },
  { // [!code focus:10]
    fees: {
      baseFeeMultiplier: 1.2,
      // or
      async baseFeeMultiplier({ block, request }) {
        // some async work
        return // ...
      }
    }
  }
)
```

#### `fees.defaultPriorityFee`

- **Type**: `number | ((args: FeesFnParameters) => Promise<bigint> | bigint)`

The default `maxPriorityFeePerGas` to use when a priority fee is not defined upon sending a transaction.

Also overrides the return value in the [`estimateMaxPriorityFeePerGas` Action](/docs/actions/public/estimateMaxPriorityFeePerGas) and `maxPriorityFeePerGas` value in [`estimateFeesPerGas`](/docs/actions/public/estimateFeesPerGas).

**Parameters**

- `block`: The latest block.
- `client`: The Client instance.
- `request`: The transaction request (if exists).

```ts
import { defineChain } from 'viem'

const zora = defineChain(
  { /* ... */ },
  { // [!code focus:9]
    fees: {
      defaultPriorityFee: parseGwei('0.01'),
      // or
      async defaultPriorityFee({ block, request }) {
        // some async work
        return // ...
      }
    }
  }
)
```

#### `fees.estimateFeesPerGas`

- **Type**: `(args: FeesFnParameters) => Promise<EstimateFeesPerGasResponse>`

Allows customization of fee per gas values (ie. `maxFeePerGas`, `maxPriorityFeePerGas`, `gasPrice`).

Also overrides the return value in [`estimateFeesPerGas`](/docs/actions/public/estimateFeesPerGas).

**Parameters**

- `block`: The latest block.
- `client`: The Client instance.
- `multiply`: A function to apply the `baseFeeMultiplier` to the provided value.
- `request`: The transaction request (if exists).
- `type`: The transaction type (ie. `legacy` or `eip1559`).

```ts
import { defineChain } from 'viem'

const zora = defineChain(
  { /* ... */ },
  { // [!code focus:14]
    fees: {
      async estimateFeesPerGas({ client, multiply, type }) {
        const gasPrice = // ...
        const baseFeePerGas = // ...
        const maxPriorityFeePerGas = // ...

        if (type === 'legacy') return { gasPrice: multiply(gasPrice) }
        return {
          maxFeePerGas: multiply(baseFeePerGas) + maxPriorityFeePerGas,
          maxPriorityFeePerGas
        }
      }
    }
  }
)
```

### Formatters

### Serializers
