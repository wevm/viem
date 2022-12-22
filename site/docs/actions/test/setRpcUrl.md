# setRpcUrl

Enable or disable logging on the test node network.

## Import 

```ts
import { setRpcUrl } from 'viem'
```

## Usage

```ts
import { setRpcUrl } from 'viem'
import { testClient } from '.'
 
await setRpcUrl(testClient, { // [!code focus:4]
  rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2'
})
```

## Configuration

### rpcUrl

- **Type:** `string`

The RPC URL.

```ts
await setRpcUrl(testClient, {
  rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2' // [!code focus]
})
```