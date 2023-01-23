# setAutomine

Enables or disables the automatic mining of new blocks with each new transaction submitted to the network.

## Import 

```ts
import { setAutomine } from 'viem'
```

## Usage

```ts
import { setAutomine } from 'viem'
import { testClient } from '.'
 
await setAutomine(testClient, true) // [!code focus]
```

## Parameters

### enabled

- **Type:** `boolean`

```ts
await setAutomine(testClient, false) // [!code focus]
```