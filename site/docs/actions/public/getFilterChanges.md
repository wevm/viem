# getFilterChanges

Returns a list of all logs based on Filter ID.

A Filter ID can be created from the following actions:

- [`createFilter`](/TODO)
- [`createBlockFilter`](/TODO)
- [`createPendingTransactionFilter`](/TODO)

## Import

```ts
import { getFilterChanges } from 'viem'
```

## Usage

```ts
import { createPendingTransactionFilter, getFilterChanges } from 'viem'
import { publicClient } from '.'

const filter = await createPendingTransactionFilter(publicClient)
const logs = await getFilterChanges(publicClient, { filter }) // [!code focus:99]
// ["0x89b3aa1c01ca4da5d15eca9fab459d062db5c0c9b76609acb0741901f01f6d19", ...]
```

## Returns

[`Log[]`](/TODO)

If the filter was created with `createFilter`, it returns a list of logs.

**OR**

[`"0x${string}"[]`](/TODO)

If the filter was created with `createPendingTransactionFilter`, it returns a list of transaction hashes.

**OR**

[`"0x${string}"[]`](/TODO)

If the filter was created with `createBlockFilter`, it returns a list of block hashes.

## Configuration

### filter

- **Type:** [`Filter`](/TODO)

A created filter.

```ts
const filter = await createPendingTransactionFilter(publicClient)
const logs = await getFilterChanges(publicClient, {
  filter, // [!code focus]
})
```

## Example

TODO
