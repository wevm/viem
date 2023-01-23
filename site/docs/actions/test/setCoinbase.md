# setCoinbase

Sets the coinbase address to be used in new blocks.

## Import 

```ts
import { setCoinbase } from 'viem'
```

## Usage

```ts
import { setCoinbase } from 'viem'
import { testClient } from '.'
 
await setCoinbase(testClient, { // [!code focus:99]
  address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
})
```

## Parameters

### address

- **Type:** `Address`

The coinbase address.

```ts
await setCoinbase(testClient, {
  address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79', // [!code focus]
})
```
