# getStorageAt

Returns the value from a storage slot at a given address.

## Usage

::: code-group

```ts [example.ts]
import { toHex } from 'viem'
import { wagmiAbi } from './abi'
import { publicClient } from './client'

const data = await publicClient.getStorageAt({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  slot: toHex(0)
})
```

```ts [client.ts]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

## Return Value

`Hex`

The value of the storage slot.

## Parameters

### address

- **Type**: `Address`

The contract address.

```ts
const data = await publicClient.getStorageAt({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
  slot: toHex(0)
})
```

### slot

- **Type**: `Hex`

The storage position (as a hex encoded value).

```ts
const data = await publicClient.getStorageAt({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  slot: toHex(0) // [!code focus]
})
```

