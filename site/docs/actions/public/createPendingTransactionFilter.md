# createPendingTransactionFilter

Creates a Filter to listen for new pending transactions that can be used with [`getFilterChanges`](/TODO).

## Import

```ts
import { getFilterChanges } from 'viem'
```

## Usage

```ts
import { createPendingTransactionFilter, getFilterChanges } from 'viem'
import { publicClient } from '.'

const filter = await createPendingTransactionFilter(publicClient) // [!code focus:99]
// { id: "0x345a6572337856574a76364e457a4366", type: 'transaction' }
```

## Returns

[`Filter`](/TODO)

## Example

TODO
