# createBlockFilter

Creates a Filter to listen for new block hashes that can be used with [`getFilterChanges`](/TODO).

## Import

```ts
import { createBlockFilter } from 'viem'
```

## Usage

```ts
import { createBlockFilter } from 'viem'
import { publicClient } from '.'

const filter = await createBlockFilter(publicClient) // [!code focus:99]
// { id: "0x345a6572337856574a76364e457a4366", type: 'block' }
```

## Returns

[`Filter`](/docs/glossary/types#TODO)
