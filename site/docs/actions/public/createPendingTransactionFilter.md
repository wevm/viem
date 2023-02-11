# createPendingTransactionFilter

Creates a Filter to listen for new pending transaction hashes that can be used with [`getFilterChanges`](/docs/actions/public/getFilterChanges).

## Import

```ts
import { createPendingTransactionFilter } from 'viem/public'
```

## Usage

```ts
import { createPendingTransactionFilter } from 'viem/public'
import { publicClient } from '.'

const filter = await createPendingTransactionFilter(publicClient) // [!code focus:99]
// { id: "0x345a6572337856574a76364e457a4366", type: 'transaction' }
```

## Returns

[`Filter`](/docs/glossary/types#TODO)

