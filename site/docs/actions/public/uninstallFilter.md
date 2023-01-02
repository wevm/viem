# uninstallFilter

Destroys a Filter that was created from one of the following actions:

- [`createFilter`](/TODO)
- [`createBlockFilter`](/TODO)
- [`createPendingTransactionFilter`](/TODO)

## Import

```ts
import { uninstallFilter } from 'viem'
```

## Usage

```ts
import { createPendingTransactionFilter, uninstallFilter } from 'viem'
import { publicClient } from '.'

const filter = await createPendingTransactionFilter(publicClient)
const uninstalled = await uninstallFilter(publicClient, { filter }) // [!code focus:99]
// true
```

## Returns

`boolean`

A boolean indicating if the Filter was successfully uninstalled.

## Configuration

### filter

- **Type:** [`Filter`](/TODO)

A created filter.

```ts
const filter = await createPendingTransactionFilter(publicClient)
const uninstalled = await uninstallFilter(publicClient, {
  filter, // [!code focus]
})
```

## Example

TODO
