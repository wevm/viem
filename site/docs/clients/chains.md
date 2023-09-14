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

The `viem/chains` entrypoint contains references to popular EVM-compatible chains such as: Polygon, Optimism, Avalanche, Base, Zora, and more.

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

[See here for a list of supported chains](https://github.com/wagmi-dev/viem/tree/main/src/chains/index.ts).

> Want to add a chain that's not listed in viem? Read the [Contributing Guide](https://github.com/wagmi-dev/viem/blob/main/.github/CONTRIBUTING.md#chains), and then open a Pull Request with your chain.

## Custom Chains

You can also extend viem to support other EVM-compatible chains by building your own chain object that inherits the `Chain` type.

```ts
import { defineChain } from 'viem'

export const zora = defineChain({
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

const example = defineChain(
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

const example = defineChain(
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

const example = defineChain(
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

You can modify how Blocks & Transactions are formatted by using the `formatters` property on the Chain.

This is useful for chains that have a different Block or Transaction structure than Mainnet (e.g. Celo & OP Stack chains).

#### `formatters.block`

You can modify how Blocks are formatted by using the `formatters.block` property on the Chain.

You can either pass in the Block overrides, or the whole Block itself to the `format` function of `defineBlock`. You can also exclude certain properties with `exclude`.

```ts
import { defineBlock, defineChain, hexToBigInt } from 'viem'

type RpcBlockOverrides = { // [!code focus:6]
  secondaryFee: `0x${string}`
}
type BlockOverrides = {
  secondaryFee: bigint
}

const example = defineChain(
  { /* ... */ },
  { // [!code focus:12]
    formatters: {
      block: defineBlock({
        exclude: ['difficulty'],
        format(args: RpcBlockOverrides): BlockOverrides {
          return {
            secondaryFee: hexToBigInt(args.secondaryFee)
          }
        }
      })
    }
  }
)

const block = await client.getBlock() // [!code focus:2]
//    ^? { ..., difficulty: never, secondaryFee: bigint, ... }
```

#### `formatters.transaction`

You can modify how Transactions are formatted by using the `formatters.transaction` property on the Chain.

You can either pass in the Transaction overrides, or the whole Transaction itself to the `format` function of `defineTransaction`. You can also exclude certain properties with `exclude`.

```ts
import { defineTransaction, defineChain, hexToBigInt } from 'viem'

type RpcTransactionOverrides = { // [!code focus:6]
  mint: `0x${string}`
}
type TransactionOverrides = {
  mint: bigint
}

const example = defineChain(
  { /* ... */ },
  { // [!code focus:12]
    formatters: {
      transaction: defineTransaction({
        exclude: ['gasPrice'],
        format(args: RpcTransactionOverrides): TransactionOverrides {
          return {
            mint: hexToBigInt(args.mint)
          }
        }
      })
    }
  }
)

const transaction = await client.getTransaction({ hash: '0x...' }) // [!code focus:2]
//    ^? { ..., gasPrice: never, mint: bigint, ... }
```

#### `formatters.transactionReceipt`

You can modify how Transaction Receipts are formatted by using the `formatters.transactionReceipt` property on the Chain.

You can either pass in the Transaction Receipt overrides, or the whole Transaction Receipt itself to the `format` function of `defineTransactionReceipt`. You can also exclude certain properties with `exclude`.

```ts
import { defineTransactionReceipt, defineChain, hexToBigInt } from 'viem'

type RpcTransactionReceiptOverrides = { // [!code focus:6]
  l1Fee: `0x${string}`
}
type TransactionReceiptOverrides = {
  l1Fee: bigint
}

const example = defineChain(
  { /* ... */ },
  { // [!code focus:12]
    formatters: {
      transactionReceipt: defineTransactionReceipt({
        exclude: ['effectiveGasPrice'],
        format(args: RpcTransactionReceiptOverrides): 
          TransactionReceiptOverrides {
          return {
            l1Fee: hexToBigInt(args.l1Fee)
          }
        }
      })
    }
  }
)

const receipt = await client.getTransactionReceipt({ hash: '0x...' }) // [!code focus:2]
//    ^? { ..., effectiveGasPrice: never, l1Fee: bigint, ... }
```

#### `formatters.transactionRequest`

You can modify how Transaction Requests are formatted by using the `formatters.transactionRequest` property on the Chain.

You can either pass in the Transaction Request overrides, or the whole Transaction Request itself to the `format` function of `defineTransactionRequest`. You can also exclude certain properties with `exclude`.

```ts
import { defineTransactionRequest, defineChain, hexToBigInt } from 'viem'

type RpcTransactionRequestOverrides = { // [!code focus:6]
  secondaryFee: `0x${string}`
}
type TransactionRequestOverrides = {
  secondaryFee: bigint
}

const example = defineChain(
  { /* ... */ },
  { // [!code focus:12]
    formatters: {
      transactionRequest: defineTransactionRequest({
        exclude: ['effectiveGasPrice'],
        format(args: TransactionRequestOverrides): 
          RpcTransactionRequestOverrides {
          return {
            secondaryFee: numberToHex(args.secondaryFee)
          }
        }
      })
    }
  }
)

const receipt = await client.getTransactionReceipt({ hash: '0x...' }) // [!code focus:2]
//    ^? { ..., effectiveGasPrice: never, l1Fee: bigint, ... }
```

### Serializers

#### `serializers.transaction`

- **Type**: `(transaction: Transaction, signature?: Signature) => "0x${string}"`

You can modify how Transactions are serialized by using the `serializers.transaction` property on the Chain.

**Parameters**

- `transaction`: The transaction to serialize.
- `signature`: The transaction signature (if exists).

```ts
import { defineChain, serializeTransaction } from 'viem'

const example = defineChain(
  { /* ... */ },
  { // [!code focus:7]
    serializers: {
      transaction(transaction, signature) {
        return serializeTransaction(transaction, signature)
      }
    }
  }
)
```
