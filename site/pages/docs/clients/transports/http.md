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
  transport: http('https://1.rpc.thirdweb.com/...'), // [!code focus]
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
const transport = http('https://1.rpc.thirdweb.com/...', {
  batch: true // [!code focus]
})
```

Now when you invoke Actions, the `http` Transport will batch and send over those requests at the end of the message queue (or custom time period) in a single Batch JSON-RPC HTTP request:

```ts twoslash
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://1.rpc.thirdweb.com/...'), 
})
// ---cut---
// The below will send a single Batch JSON-RPC HTTP request to the RPC Provider.
const [blockNumber, balance, ensName] = await Promise.all([
  client.getBlockNumber(),
  client.getBalance({ address: '0xd2135CfB216b74109775236E36d4b433F1DF507B' }),
  client.getEnsName({ address: '0xd2135CfB216b74109775236E36d4b433F1DF507B' }),
])
```

## Tor Support

The `http` Transport supports routing requests through the Tor network for enhanced privacy. This is useful when you want to anonymize your RPC requests.

```ts twoslash
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http({
    tor: { // [!code focus:4]
      snowflakeUrl: 'wss://snowflake.pse.dev/',
      filter: ['eth_sendRawTransaction'],
    },
  }),
})
```

You can configure which RPC methods should be routed through Tor using the `filter` option. In the example above, only `eth_sendRawTransaction` calls will go through Tor, while other methods will use the regular HTTP connection.

## Parameters

### url (optional)

- **Type:** `string`
- **Default:** `chain.rpcUrls.default.http[0]`

URL of the JSON-RPC API.

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://1.rpc.thirdweb.com/...')
```

### batch (optional)

- **Type:** `boolean | BatchOptions`
- **Default:** `false`

Toggle to enable Batch JSON-RPC

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://1.rpc.thirdweb.com/...', {
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
const transport = http('https://1.rpc.thirdweb.com/...', {
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
const transport = http('https://1.rpc.thirdweb.com/...', {
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
const transport = http('https://1.rpc.thirdweb.com/...', {
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
const transport = http('https://1.rpc.thirdweb.com/...', {
  key: 'alchemy', // [!code focus]
})
```

### methods (optional)

- **Type:** `{ include?: string[], exclude?: string[] }`

Methods to include or exclude from sending RPC requests.

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://1.rpc.thirdweb.com/...', {
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
const transport = http('https://1.rpc.thirdweb.com/...', {
  name: 'Alchemy HTTP Provider', // [!code focus]
})
```

### onFetchRequest (optional)

- **Type:** `(request: Request) => void`

A callback to handle the fetch request. Useful for logging or debugging.

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://1.rpc.thirdweb.com/...', {
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
const transport = http('https://1.rpc.thirdweb.com/...', {
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
const transport = http('https://1.rpc.thirdweb.com/...', {
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
const transport = http('https://1.rpc.thirdweb.com/...', {
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
const transport = http('https://1.rpc.thirdweb.com/...', {
  timeout: 60_000, // [!code focus]
})
```

### tor (optional)

- **Type:** `TorClientOptions & { sharedClient?: TorClient, filter: string[] | ((input: RequestInfo | URL, init?: RequestInit) => boolean) }`

Configuration for routing requests through the Tor network. Requires `snowflakeUrl`, `filter`. Additional TorClientOptions are documented at [tor-hazae41](https://www.npmjs.com/package/tor-hazae41).

```ts twoslash
import { http } from 'viem'
// ---cut---
const transport = http('https://1.rpc.thirdweb.com/...', {
  tor: { // [!code focus:4]
    snowflakeUrl: 'wss://snowflake.pse.dev/',
    filter: ['eth_sendRawTransaction'],
  },
})
```

### tor.snowflakeUrl

- **Type:** `string`

The URL of the Snowflake proxy server for Tor connectivity.

### tor.filter

- **Type:** `string[] | ((input: RequestInfo | URL, init?: RequestInit) => boolean)`

Determines which requests should be routed through Tor:
- If an array of strings: Only RPC methods matching these names will use Tor
- If a function: Called for each request to determine if it should use Tor

### tor.url (optional)

- **Type:** `string`
- **Default:** Same URL as non-Tor requests

The RPC URL to use when routing requests through Tor.

### tor.sharedClient (optional)

- **Type:** `TorClient`

A shared TorClient instance to reuse across multiple transports. If not provided, a new TorClient will be created using the other TorClientOptions.

### tor.timeout (optional)

- **Type:** `number`
- **Default:** `max(60_000, config.timeout)`

The timeout (in ms) for the HTTP request over Tor.
