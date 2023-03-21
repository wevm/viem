---
head:
  - - meta
    - property: og:title
      content: Fallback Transport
  - - meta
    - name: description
      content: A function to create a Fallback Transport for a Client.
  - - meta
    - property: og:description
      content: A function to create a Fallback Transport for a Client.

---

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

### Transport Ranking

By default, each of the Transports passed to the `fallback` Transport are automatically ranked based on their **latency** & **stability** via a weighted moving score algorithm. 

Every 10 seconds (`interval`), the `fallback` Transport will ping each transport in the list. For the past 10 pings (`sampleCount`), they will be ranked based on if they responded (stability) and how fast they responded (latency). The algorithm applies a weight of `0.7` to the stability score, and a weight of `0.3` to the latency score to derive the final score which it is ranked on.

The Transport that has the best latency & stability score over the sample period is prioritized first. 

You can modify the default rank config using the `rank` parameter:

```ts
const client = createPublicClient({
  chain: mainnet,
  transport: fallback(
    [alchemy, infura],
    { // [!code focus:9]
      rank: {
        interval: 60_000,
        latencyWeight: 0.4,
        sampleCount: 5,
        stabilityWeight: 0.6,
        timeout: 500
      }
    }
  ),
})
```

Or you can turn it off automated ranking by passing `false` to `rank`:

```ts
const client = createPublicClient({
  chain: mainnet,
  transport: fallback(
    [alchemy, infura],
    { rank: false } // [!code focus]
  ),
})
```

## Parameters

### rank (optional)

- **Type:** `boolean | RankOptions`
- **Default:** `true`

### rank.interval (optional)

- **Type:** `number`
- **Default:** `client.pollingInterval`

The polling interval (in ms) at which the ranker should ping the RPC URL.

```ts
const transport = fallback([alchemy, infura], {
  rank: { // [!code focus:3]
    interval: 5_000
  },
})
```

### rank.latencyWeight (optional)

- **Type:** `number`
- **Default:** `0.3`

The weight to apply to the latency score.

```ts
const transport = fallback([alchemy, infura], {
  rank: { // [!code focus:3]
    latencyWeight: 0.4
  },
})
```

### rank.sampleCount (optional)

- **Type:** `number`
- **Default:** `10`

The number of previous samples to perform ranking on.

```ts
const transport = fallback([alchemy, infura], {
  rank: { // [!code focus:3]
    sampleCount: 10
  },
})
```

### rank.stabilityWeight (optional)

- **Type:** `number`
- **Default:** `0.7`

The weight to apply to the stability score.

```ts
const transport = fallback([alchemy, infura], {
  rank: { // [!code focus:3]
    stabilityWeight: 0.6
  },
})
```

### rank.timeout (optional)

- **Type:** `number`
- **Default:** `1_000`

Timeout when sampling transports.

```ts
const transport = fallback([alchemy, infura], {
  rank: { // [!code focus:3]
    timeout: 500
  },
})
```

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

