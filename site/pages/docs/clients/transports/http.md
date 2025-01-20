# HTTP Transport [A function to create a HTTP Transport for a Client]

The `http` Transport connects to a JSON-RPC API via HTTP.

## Import

```ts twoslash
import { http } from 'viem'
```

## Usage

```ts twoslash {4}
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://eth-mainnet.g.alchemy.com/v2/...'), // [!code focus]
})
```

:::warning[Warning]
If no `url` is provided, then the transport will fall back to a public RPC URL on the chain. It is highly recommended to provide an authenticated RPC URL to prevent rate-limiting.
:::

### Batch JSON-RPC

The `http` Transport supports Batch JSON-RPC. This means that multiple JSON-RPC requests can be sent in a single HTTP request.

The Transport will batch up Actions over a given period and execute them in a single Batch JSON-RPC HTTP request. By default, this period is a [zero delay](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop#zero_delays) meaning that the batch request will be executed at the end of the current [JavaScript message queue](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop#queue). Consumers can specify a custom time period `wait` (in ms).

You can enable Batch JSON-RPC by setting the `batch` flag to `true`:

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://eth-mainnet.g.alchemy.com/v2/...', {
  batch: true // [!code focus]
})
```

Now when you invoke Actions, the `http` Transport will batch and send over those requests at the end of the message queue (or custom time period) in a single Batch JSON-RPC HTTP request:

```ts twoslash
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://eth-mainnet.g.alchemy.com/v2/...'), 
})
// ---cut---
// The below will send a single Batch JSON-RPC HTTP request to the RPC Provider.
const [blockNumber, balance, ensName] = await Promise.all([
  client.getBlockNumber(),
  client.getBalance({ address: '0xd2135CfB216b74109775236E36d4b433F1DF507B' }),
  client.getEnsName({ address: '0xd2135CfB216b74109775236E36d4b433F1DF507B' }),
])
```

## Parameters

### url (optional)

- **Type:** `string`
- **Default:** `chain.rpcUrls.default.http[0]`

URL of the JSON-RPC API.

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://eth-mainnet.g.alchemy.com/v2/...')
```

### batch (optional)

- **Type:** `boolean | BatchOptions`
- **Default:** `false`

Toggle to enable Batch JSON-RPC

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://eth-mainnet.g.alchemy.com/v2/...', {
  batch: true // [!code focus]
})
```

### batch.batchSize (optional)

- **Type:** `number`
- **Default:** `1_000`

The maximum number of JSON-RPC requests to send in a batch.

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://eth-mainnet.g.alchemy.com/v2/...', {
  batch: {
    batchSize: 2_000 // [!code focus]
  }
})
```

### batch.wait (optional)

- **Type:** `number`
- **Default:** `0` ([zero delay](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop#zero_delays))

The maximum number of milliseconds to wait before sending a batch.

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://eth-mainnet.g.alchemy.com/v2/...', {
  batch: {
    wait: 16 // [!code focus]
  }
})
```

### fetchOptions (optional)

- **Type:** [`RequestInit`](https://developer.mozilla.org/en-US/docs/Web/API/fetch)

[Fetch options](https://developer.mozilla.org/en-US/docs/Web/API/fetch) to pass to the internal `fetch` function. Useful for passing auth headers or cache options.

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://eth-mainnet.g.alchemy.com/v2/...', {
  fetchOptions: { // [!code focus:5]
    headers: {
      'Authorization': 'Bearer ...'
    }
  }
})
```

### key (optional)

- **Type:** `string`
- **Default:** `"http"`

A key for the Transport.

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://eth-mainnet.g.alchemy.com/v2/...', {
  key: 'alchemy', // [!code focus]
})
```

### methods (optional)

- **Type:** `{ include?: string[], exclude?: string[] }`

Methods to include or exclude from sending RPC requests.

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://eth-mainnet.g.alchemy.com/v2/...', {
  methods: {
    include: ['eth_sendTransaction', 'eth_signTypedData_v4'],
  },
})
```

### name (optional)

- **Type:** `string`
- **Default:** `"HTTP JSON-RPC"`

A name for the Transport

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://eth-mainnet.g.alchemy.com/v2/...', {
  name: 'Alchemy HTTP Provider', // [!code focus]
})
```

### onFetchRequest (optional)

- **Type:** `(request: Request) => void`

A callback to handle the fetch request. Useful for logging or debugging.

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://eth-mainnet.g.alchemy.com/v2/...', {
  onFetchRequest(request) {
    console.log(request) // [!code focus]
  }
})
```

### onFetchResponse (optional)

- **Type:** `(response: Response) => void`

A callback to handle the fetch response. Useful for logging or debugging.

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://eth-mainnet.g.alchemy.com/v2/...', {
  onFetchResponse(response) {
    console.log(response) // [!code focus]
  }
})
```

### retryCount (optional)

- **Type:** `number`
- **Default:** `3`

The max number of times to retry when a request fails.

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://eth-mainnet.g.alchemy.com/v2/...', {
  retryCount: 5, // [!code focus]
})
```

### retryDelay (optional)

- **Type:** `number`
- **Default:** `150`

The base delay (in ms) between retries. By default, the Transport will use [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) (`~~(1 << count) * retryDelay`), which means the time between retries is not constant.

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://eth-mainnet.g.alchemy.com/v2/...', {
  retryDelay: 100, // [!code focus]
})
```

### timeout (optional)

- **Type:** `number`
- **Default:** `10_000`

The timeout for requests.

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://eth-mainnet.g.alchemy.com/v2/...', {
  timeout: 60_000, // [!code focus]
})
```

