# getBytecode

Retrieves the bytecode at an address.

## Usage

::: code-group

```ts [example.ts]
import { publicClient } from './client'

const bytecode = await publicClient.getBytecode({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
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

The contract's bytecode.

## Parameters

### address

- **Type**: `Address`

The contract address.

```ts
const bytecode = await publicClient.getBytecode({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
})
```