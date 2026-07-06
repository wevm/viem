# Fees [Configure chain-based fee data in Viem]

You can modify how fees are derived by using the `fees` property on the Chain.

## Usage

```tsx
import { defineChain } from 'viem'

export const example = defineChain({
  /* ... */
  fees: { 
    baseFeeMultiplier: 1.2, 
    defaultPriorityFee: parseGwei('0.01'), 
  } 
})
```

## API

### `fees.baseFeeMultiplier`

- **Type**: `number`
- **Default**: `1.2`

The fee multiplier to use to account for fee fluctuations. Used in the [`estimateFeesPerGas` Action](/docs/actions/public/estimateFeesPerGas) against the latest block's base fee per gas to derive a final `maxFeePerGas` (EIP-1193), or gas price to derive a final `gasPrice` (Legacy).

**Parameters**

- `block`: The latest block.
- `client`: The Client instance.
- `request`: The transaction request (if exists).

```ts
import { defineChain } from 'viem'

const example = defineChain({ 
  /* ... */
  fees: { // [!code focus:8]
    baseFeeMultiplier: 1.2,
    // or
    async baseFeeMultiplier({ block, request }) {
      // some async work
      return // ...
    },
  },
})
```

### `fees.defaultPriorityFee`

- **Type**: `number | ((args: FeesFnParameters) => Promise<bigint> | bigint)`

The default `maxPriorityFeePerGas` to use when a priority fee is not defined upon sending a transaction.

Also overrides the return value in the [`estimateMaxPriorityFeePerGas` Action](/docs/actions/public/estimateMaxPriorityFeePerGas) and `maxPriorityFeePerGas` value in [`estimateFeesPerGas`](/docs/actions/public/estimateFeesPerGas).

**Parameters**

- `block`: The latest block.
- `client`: The Client instance.
- `request`: The transaction request (if exists).

```ts
import { defineChain } from 'viem'

const example = defineChain({
  /* ... */
  fees: { // [!code focus:8]
    defaultPriorityFee: parseGwei('0.01'),
    // or
    async defaultPriorityFee({ block, request }) {
      // some async work
      return // ...
    },
  },
})
```

### `fees.estimateFeesPerGas`

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

const example = defineChain({
  /* ... */
  fees: { // [!code focus:13]
    async estimateFeesPerGas({ client, multiply, type }) {
      const gasPrice = // ...
      const baseFeePerGas = // ...
      const maxPriorityFeePerGas = // ...

      if (type === 'legacy') return { gasPrice: multiply(gasPrice) }
      return {
        maxFeePerGas: multiply(baseFeePerGas) + maxPriorityFeePerGas,
        maxPriorityFeePerGas
      },
    },
  },
})
```
