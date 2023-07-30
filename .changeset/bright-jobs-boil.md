---
"viem": minor
---

Narrowed `getBlock`, `watchBlocks`, `getFilterChanges`, `getFilterLogs` & `getLogs` return types for when `blockTag` or `includeTransactions` is provided.

- When `blockTag !== 'pending'`, the return type will now include some non-nullish properties if it were dependent on pending blocks. Example: For `getBlock`, the `block.number` type is now non-nullish since `blockTag !== 'pending'`.
- On the other hand, when `blockTag: 'pending'`, some properties will be nullish. Example: For `getBlock`, the `block.number` type is now `null` since `blockTag === 'pending'`.
- When `includeTransactions` is provided, the return type of will narrow the `transactions` property type. Example: `block.transactions` will be `Transaction[]` when `includeTransactions: true` instead of `Hash[] | Transaction[]`.

TLDR;

```ts
// Before
const block = publicClient.getBlock({ includeTransactions: true })
block.transactions
//    ^? Hash[] | Transaction[]
block.transactions[0].blockNumber
//                    ^? bigint | null

// After
const block = publicClient.getBlock({ includeTransactions: true })
block.transactions
//    ^? Transaction[]
block.transactions[0].blockNumber
//                    ^? bigint

// Before
const block = publicClient.getBlock({ blockTag: 'pending', includeTransactions: true })
block.number
//    ^? number | null
block.transactions[0].blockNumber
//                    ^? bigint | null

// After
const block = publicClient.getBlock({ blockTag: 'pending', includeTransactions: true })
block.number
//    ^? null
block.transactions[0].blockNumber
//                    ^? null
```
