# Formatters [Configure chain-based formatters in Viem]

You can modify how Blocks & Transactions are formatted by using the `formatters` property on the Chain.

This is useful for chains that have a different Block or Transaction structure than Mainnet (e.g. Celo & OP Stack chains).

## Usage

```tsx
import { 
  defineBlock,
  defineChain,
  defineTransaction, 
  defineTransactionReceipt, 
  defineTransactionRequest 
} from 'viem' 

export const example = defineChain({
  /* ... */
  formatters: { 
    block: defineBlock(/* ... */),
    transaction: defineTransaction(/* ... */),
    transactionReceipt: defineTransactionReceipt(/* ... */),
    transactionRequest: defineTransactionRequest(/* ... */),
  } 
})
```

## API

### `formatters.block`

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

const example = defineChain({
  /* ... */
  formatters: { // [!code focus:10]
    block: defineBlock({
      exclude: ['difficulty'],
      format(args: RpcBlockOverrides): BlockOverrides {
        return {
          secondaryFee: hexToBigInt(args.secondaryFee)
        }
      },
    }),
  },
})

const block = await client.getBlock() // [!code focus:2]
//    ^? { ..., difficulty: never, secondaryFee: bigint, ... }
```

### `formatters.transaction`

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

const example = defineChain({
  /* ... */
  formatters: { // [!code focus:10]
    transaction: defineTransaction({
      exclude: ['gasPrice'],
      format(args: RpcTransactionOverrides): TransactionOverrides {
        return {
          mint: hexToBigInt(args.mint)
        }
      },
    }),
  },
})

const transaction = await client.getTransaction({ hash: '0x...' }) // [!code focus:2]
//    ^? { ..., gasPrice: never, mint: bigint, ... }
```

### `formatters.transactionReceipt`

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

const example = defineChain({
  /* ... */
  formatters: { // [!code focus:11]
    transactionReceipt: defineTransactionReceipt({
      exclude: ['effectiveGasPrice'],
      format(args: RpcTransactionReceiptOverrides): 
        TransactionReceiptOverrides {
        return {
          l1Fee: hexToBigInt(args.l1Fee)
        }
      },
    }),
  },
})

const receipt = await client.getTransactionReceipt({ hash: '0x...' }) // [!code focus:2]
//    ^? { ..., effectiveGasPrice: never, l1Fee: bigint, ... }
```

### `formatters.transactionRequest`

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

const example = defineChain({
  /* ... */
  formatters: { // [!code focus:11]
    transactionRequest: defineTransactionRequest({
      exclude: ['effectiveGasPrice'],
      format(args: TransactionRequestOverrides): 
        RpcTransactionRequestOverrides {
        return {
          secondaryFee: numberToHex(args.secondaryFee)
        }
      },
    }),
  },
})

const receipt = await client.getTransactionReceipt({ hash: '0x...' }) // [!code focus:2]
//    ^? { ..., effectiveGasPrice: never, l1Fee: bigint, ... }
```
