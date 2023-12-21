---
head:
  - - meta
    - property: og:title
      content: Custom Transport
  - - meta
    - name: description
      content: A function to create a Custom Transport for a Client.
  - - meta
    - property: og:description
      content: A function to create a Custom Transport for a Client.

---

# Custom Transport

The `custom` Transport accepts an [EIP-1193 `request` function](https://eips.ethereum.org/EIPS/eip-1193#request-1) as a parameter. This transport is useful for integrating with injected wallets, wallets that provide an EIP-1193 provider (eg. WalletConnect or Coinbase SDK), or even providing your own custom `request` function.

## Import

```ts
import { custom } from 'viem'
```

## Usage

You can use any [EIP-1193 compatible](https://eips.ethereum.org/EIPS/eip-1193) Ethereum Provider with the `custom` Transport:

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})
```

Or you can define your own:

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { customRpc } from './rpc'

const client = createWalletClient({ 
  chain: mainnet,
  transport: custom({
    async request({ method, params }) {
      const response = await customRpc.request(method, params)
      return response
    }
  })
})
```

## Parameters

### provider

- **Type:** `custom`

An [EIP-1193 `request` function](https://eips.ethereum.org/EIPS/eip-1193#request) function.

```ts
import { customRpc } from './rpc'

const transport = custom({
  async request({ method, params }) { // [!code focus:3]
    const response = await customRpc.request(method, params)
    return response
  }
})
```

### key (optional)

- **Type:** `string`
- **Default:** `"custom"`

A key for the Transport.

```ts
const transport = custom(
  window.ethereum,
  { 
    key: 'windowProvider', // [!code focus]
  }
)
```

### name (optional)

- **Type:** `string`
- **Default:** `"Ethereum Provider"`

A name for the Transport

```ts
const transport = custom(
  window.ethereum,
  { 
    name: 'Window Ethereum Provider', // [!code focus]
  }
)
```

### retryCount (optional)

- **Type:** `number`
- **Default:** `3`

The max number of times to retry when a request fails.

```ts
const transport = custom(window.ethereum, {
  retryCount: 5, // [!code focus]
})
```

### retryDelay (optional)

- **Type:** `number`
- **Default:** `150`

The base delay (in ms) between retries. By default, the Transport will use [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) (`~~(1 << count) * retryDelay`), which means the time between retries is not constant.

```ts
const transport = custom(window.ethereum, {
  retryDelay: 100, // [!code focus]
})
```

## Gotchas

- If you are pairing the `custom` Transport with a [Public Client](/docs/clients/public), ensure that your provider supports [Public Actions](/docs/actions/public/introduction).