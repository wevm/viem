# getFilterChanges

Returns a list of logs or hashes based on a [Filter](/docs/glossary/terms#TODO) since the last time it was called.

A Filter can be created from the following actions:

- [`createBlockFilter`](/docs/actions/public/createBlockFilter)
- [`createEventFilter`](/docs/actions/public/createEventFilter)
- [`createPendingTransactionFilter`](/docs/actions/public/createPendingTransactionFilter)

## Import

```ts
import { getFilterChanges } from 'viem'
```

## Usage

### Blocks

```ts
import { createBlockFilter, getFilterChanges } from 'viem'
import { publicClient } from '.'

const filter = await createBlockFilter(publicClient) // [!code focus:99]
// ...
const hashes = await getFilterChanges(publicClient, { filter })
// ["0x10d86dc08ac2f18f00ef0daf7998dcc8673cbcf1f1501eeb2fac1afd2f851128", ...]
```

### Events

```ts
import { createEventFilter, getFilterChanges } from 'viem'
import { publicClient } from '.'

const filter = await createEventFilter(publicClient, { // [!code focus:99]
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: 'Transfer(address,address,uint256)',
})
// ...
const logs = await getFilterChanges(publicClient, { filter })
// [{ ... }, { ... }, { ... }]
```

### Transactions

```ts
import { createPendingTransactionFilter, getFilterChanges } from 'viem'
import { publicClient } from '.'

const filter = await createPendingTransactionFilter(publicClient) // [!code focus:99]
// ...
const hashes = await getFilterChanges(publicClient, { filter })
// ["0x89b3aa1c01ca4da5d15eca9fab459d062db5c0c9b76609acb0741901f01f6d19", ...]
```

## Returns

[`Log[]`](/docs/glossary/types#TODO)

If the filter was created with `createEventFilter`, it returns a list of logs.

**OR**

`"0x${string}"[]`

If the filter was created with `createPendingTransactionFilter`, it returns a list of transaction hashes.

**OR**

`"0x${string}"[]`

If the filter was created with `createBlockFilter`, it returns a list of block hashes.

## Parameters

### filter

- **Type:** [`Filter`](/docs/glossary/types#TODO)

A created filter.

```ts
const filter = await createPendingTransactionFilter(publicClient)
const logs = await getFilterChanges(publicClient, {
  filter, // [!code focus]
})
```
