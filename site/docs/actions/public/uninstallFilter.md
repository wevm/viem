# uninstallFilter

Destroys a Filter that was created from one of the following actions:

- [`createBlockFilter`](/docs/actions/public/createBlockFilter)
- [`createEventFilter`](/docs/actions/public/createEventFilter)
- [`createPendingTransactionFilter`](/docs/actions/public/createPendingTransactionFilter)

## Import

```ts
import { uninstallFilter } from 'viem/public'
```

## Usage

```ts
import { createPendingTransactionFilter, uninstallFilter } from 'viem/public'
import { publicClient } from '.'

const filter = await createPendingTransactionFilter(publicClient)
const uninstalled = await uninstallFilter(publicClient, { filter }) // [!code focus:99]
// true
```

## Returns

`boolean`

A boolean indicating if the Filter was successfully uninstalled.

## Parameters

### filter

- **Type:** [`Filter`](/docs/glossary/terms#TODO)

A created filter.

```ts
const filter = await createPendingTransactionFilter(publicClient)
const uninstalled = await uninstallFilter(publicClient, {
  filter, // [!code focus]
})
```
