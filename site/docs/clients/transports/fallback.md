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


