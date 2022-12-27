# setRpcUrl

Sets the backend RPC URL.

## Import 

```ts
import { setRpcUrl } from 'viem'
```

## Usage

```ts
import { setRpcUrl } from 'viem'
import { testClient } from '.'
 
await setRpcUrl(testClient, 'https://eth-mainnet.alchemyapi.io/v2') // [!code focus]
```