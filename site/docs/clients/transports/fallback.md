# Fallback Transport

The `fallback` Transport consumes **multiple** Transports. If a Transport request fails, it will fall back to the next one in the list.

## Import

```ts
import { fallback } from 'viem'
```

## Usage

```ts {4-9,13}
import { createPublicClient, fallback, http } from 'viem'
import { mainnet } from 'viem/chains'

const alchemy = http({ 
  url: 'https://eth-mainnet.g.alchemy.com/v2/...' 
})
const infura = http({ 
  url: 'https://mainnet.infura.io/v3/...' 
})

const client = createPublicClient({
  chain: mainnet,
  transport: fallback([alchemy, infura]),
})
```

## Parameters

### retryCount (optional)

- **Type:** `number`
- **Default:** `3`

The max number of times to retry when a request fails. 

> Note: The fallback will first try all the Transports before retrying.

```ts
const transport = fallback([alchemy, infura], {
  retryCount: 5, // [!code focus]
})
```

### retryDelay (optional)

- **Type:** `number`
- **Default:** `150`

The base delay (in ms) between retries. By default, the Transport will use [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) (`~~(1 << count) * retryDelay`), which means the time between retries is not constant.

```ts
const transport = fallback([alchemy, infura], {
  retryDelay: 100, // [!code focus]
})
```

