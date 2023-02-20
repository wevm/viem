# uninstallFilter

Destroys a Filter that was created from one of the following actions:

- [`createBlockFilter`](/docs/actions/public/createBlockFilter)
- [`createEventFilter`](/docs/actions/public/createEventFilter)
- [`createPendingTransactionFilter`](/docs/actions/public/createPendingTransactionFilter)

## Usage

```ts
import { publicClient } from '.'

const filter = await publicClient.createPendingTransactionFilter()
const uninstalled = await publicClient.uninstallFilter({ filter }) // [!code focus:99]
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
const filter = await publicClient.createPendingTransactionFilter()
const uninstalled = await publicClient.uninstallFilter({
  filter, // [!code focus]
})
```
