# IPC Transport [A function to create an IPC Transport for a Client]

The `ipc` Transport connects to a JSON-RPC API via IPC (inter-process communication).

## Import

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"845537bd5914492c60581649c34414aba1df3e6e8918ff4684367d8bc4ccc446","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvdlhGMszNPkS84aUuzABzCrxGT+7LQH4VASVkAVUszBwsEUmgDCBo93NWbdh04A6YOwAtr5o0rKU1MxaCCjIILBwIhpY4pKRzqQwivC8trxmAArOvOq29o5hSop6kmAwYnClEHm8AFIAygDyAHIAtABKxbwAgoVmAHQgALrTVGrMTkgAnFSsMNpKSADMVGiLWjAMiCAyIpEc9UgADFQi+IvMYmQrAL5zIPqweMGhvMDhES8V4CUgQIK8ADkRHYMCCAHpILBIZEgkdmEhQHQaHYJGA8GgEK9XkA="}
import { ipc } from 'viem/node'
```

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"4fa771202858bbd1abac89ccc8e7f952cd7725bf88d32241e760e33e5cab50e9","data":"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"}
import { createPublicClient } from 'viem'
import { ipc } from 'viem/node'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet, 
  transport: ipc('/tmp/reth.ipc'), // [!code hl]
})
```

## Parameters

### path

- **Type:** `string`

IPC Path the transport should connect to.

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"82a6ddffd57fe9cd5ecefedbdd38d8429f6d51cf1517ef153230c5a6d9520592","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwCSWRgBUefAQyptugpADYqAGxhgA5mnxIAnFTSKtMBomrS4/JeoCWYXIgAMVRvkXdGNcomUBfCnRsJwJiMkpqOnMQAApuNTtuOABKdjtxWKxuXWE2UgctCnZmMAAzOy0AfmExSSsbNABhFgqtFNrxKV5rWQAdMDsAW0b08UjjLQQUZBBYOEYCrDQ7Fkim0hgc+HZeUQAFJs4G2U4PDlLHbzhOCF32ACkAZQB5ADkAWgAlQ/YAQX2IgAdCAALqg+TGJSIACMAA51JodHpEABmIwmMx4DKMSKJRxIVwgdyebwRWFw/wQ4nQUKlNjHHqjAC8Y0YsQA5AB6NAjLmbXRAnEclKRIZmbhIUDRTRwVZgPBoBD+fxAA="}
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc')
```

### key (optional)

- **Type:** `string`
- **Default:** `"ipc"`

A key for the Transport.

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"477bd833fa4a0604c5e3fb147c654df87be00f014c44706d2f54b07aebca6fa7","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwCSWRgBUefAQyptugpADYqAGxhgA5mnxIAnFTSKtMBomrS4/JeoCWYXIgAMVRvkXdGNcomUBfCnRsJwJiMkpqOnMQAApuNTtuOABKdjtxWKxuXWE2UgctCnZmMAAzOy0AfmExSSsbNABhFgqtFNrxKV5rWQAdMDsAW0b08UjjLQQUZBBYOEYCrDQ7Fkim0hgc+HZeUQAFJs4G2U4PDlLHbzhOCF32ACkAZQB5ADkAWgAlQ/YAQX2IgAdCAALqg+TGJSIACMAA51JodHpEABmIwmMx4DKMSKJRxIVwgdyebwRWFwwLBHB4QgkchGaJ4LKkCA4QQYNIAaxgGBq7HyhXYAB92ABXMCwCqOKCRKAQRjTEASfAwdg8jDsCBlM5qurHHqNEGQxTmAAsZsR2l0SHR1ExMQ1eIcThhbg8PDJvgATP4IcToKFSmwDTJBOwALxjRixADkAHo0CN45tdECcbHisB2AN2OrecJY6n8B8M8V2PH4+xkABCZiwdhlBViuCggb+FKRIZmbhIUDRTRwVZgPBoBD+fxAA"}
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc', { 
  key: 'reth-ipc',  // [!code focus]
})
```

### methods (optional)

- **Type:** `{ include?: string[], exclude?: string[] }`

Methods to include or exclude from sending RPC requests.

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"14b730978cb19a93ca9dd27c7255622d570c6ca442dd10351d794cd57406792b","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwCSWRgBUefAQyptugpADYqAGxhgA5mnxIAnFTSKtMBomrS4/JeoCWYXIgAMVRvkXdGNcomUBfCnRsJwJiMkpqOnMQAApuNTtuOABKdjtxWKxuXWE2UgctCnZmMAAzOy0AfmExSSsbNABhFgqtFNrxKV5rWQAdMDsAW0b08UjjLQQUZBBYOEYCrDQ7Fkim0hgc+HZeUQAFJs4G2U4PDlLHbzhOCF32ACkAZQB5ADkAWgAlQ/YAQX2IgAdCAALqg+TGJSIACMAA51JodHpEABmIwmMx4DKMSKJRxIVwgdyebwRWFwwLBHB4QgkchGaJ4LKkCA4QQYNJDMyEKBwGrsF6OF5lAA8wAG7Cl6TAjDUAFdYAL8oVkKD2AAfdjysCwCqOKAAbgG/k17AlYGl7DocsVMGVXFV6q1Or1DhgRpNAD4za6YPqPZEoBBGNMQABZHnQG5oO4OW2wdgCa20BMwdhlVlDFMwRjylbadg/I6bACO8vgaDgIMhinMABZ0SANNpdEgAOwY0imGLc3TRvHupAwtweHhk3wAJip1BCtPCDKi9GZWFZ7MwaXjCqVeUd2jVvt1/vdUEiCmhAFYEc2kW3EJ3qJiYlu7YOCYhJ6PST4kPX/BDiWgUJSjYY4elGABeMZGFiAByAB6NARngzZdCBHFYOKC0pT7Xk4GEbDpRfWBhGQWCeQAfTgTQoG6VgvBWFhMPYcjdCoyowAkEIoAAERybgKKIetYIhSV2ECE0UkiPtuCQUBok0OBVjAPAqxAfx/CAA==="}
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc', {
  methods: {
    include: ['eth_sendTransaction', 'eth_signTypedData_v4'],
  },
})
```

### name (optional)

- **Type:** `string`
- **Default:** `"IPC JSON-RPC"`

A name for the Transport

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"d836fafdbe14331941a0b0fdd2dd3b366e4d2f8a1bd9497069c6d94e468d0d55","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwCSWRgBUefAQyptugpADYqAGxhgA5mnxIAnFTSKtMBomrS4/JeoCWYXIgAMVRvkXdGNcomUBfCnRsJwJiMkpqOnMQAApuNTtuOABKdjtxWKxuXWE2UgctCnZmMAAzOy0AfmExSSsbNABhFgqtFNrxKV5rWQAdMDsAW0b08UjjLQQUZBBYOEYCrDQ7Fkim0hgc+HZeUQAFJs4G2U4PDlLHbzhOCF32ACkAZQB5ADkAWgAlQ/YAQX2IgAdCAALqg+TGJSIACMAA51JodHpEABmIwmMx4DKMSKJRxIVwgdyebwRWFwwLBHB4QgkchGaJ4LKkCA4QQYNJgbhDGA1dj5QrsAA+7AArmBYBVHFBIlAIIxpiAJPgYOxubz2BAymc1XVjj1GiDIYpzAAWM2I7S6JCW6iYmIa3D2AmwtweHhk3wAJn8EOJ0FCpTYBpkgnYAF4xoxYgByAD0aBG8c2uiBONjxWA7AG7HVPJgwljXzM+AOTUzefj8fYyAAhMxYOwygqxXBQQN/ClIrzjEhQNFNHBVmA8GgEP5/EA==="}
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc', { 
  name: 'Reth IPC',  // [!code focus]
})
```

### reconnect (optional)

- **Type:** `boolean | { maxAttempts?: number, delay?: number }`
- **Default:** `true`

Whether or not to attempt to reconnect on socket failure.

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"35ee3f1202654e2b931d1a2f3bb1be7b306c9401f08504cbf18fa306a23fbe54","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwCSWRgBUefAQyptugpADYqAGxhgA5mnxIAnFTSKtMBomrS4/JeoCWYXIgAMVRvkXdGNcomUBfCnRsJwJiMkpqOnMQAApuNTtuOABKdjtxWKxuXWE2UgctCnZmMAAzOy0AfmExSSsbNABhFgqtFNrxKV5rWQAdMDsAW0b08UjjLQQUZBBYOEYCrDQ7Fkim0hgc+HZeUQAFJs4G2U4PDlLHbzhOCF32ACkAZQB5ADkAWgAlQ/YAQX2IgAdCAALqg+TGJSIACMAA51JodHpEABmIwmMx4DKMSKJRxIVwgdyebwRWFwwLBHB4QgkchGaJ4LKkCA4QQYNKbS4wbw1dgAIwgEA0ewAPuxgAN2DLdmgaCM0HB+WAAK5DAVkdgS1VgWAVRxQADc0tlsDU3AwKvVmtI2vYuv1DhgxoG/ntjpgBpdkSgEEY0xAAHV8GZQ3aBOxIBw0Hccgrlrd2NyWFcOCx2HB/QBrMzsMrcOxqVWbEEYqZIZCzfXcVVqOSWVW4cGQxTmAAs6JAGm0ugMGNIphiKbAabxzqQMLcHh4ZN8ACZ/BDidBQqU2MceqMALxjRixADkAHo0CMj5tdECcQfilKwDKR2nhAW1HAYMUj0f2MgAITMWD5v6qpwKCbopJEQxmNwSCgNEmhwKsYB4EqID+P4QA"}
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc', {
  reconnect: false, // [!code focus]
})
```

#### reconnect.attempts (optional)

- **Type:** `number`
- **Default:** `5`

The max number of times to attempt to reconnect.

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"ecda1d53820118af09d847adabafdc0493c5c0506bcf1270fe02ef47c7c789ff","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwCSWRgBUefAQyptugpADYqAGxhgA5mnxIAnFTSKtMBomrS4/JeoCWYXIgAMVRvkXdGNcomUBfCnRsJwJiMkpqOnMQAApuNTtuOABKdjtxWKxuXWE2UgctCnZmMAAzOy0AfmExSSsbNABhFgqtFNrxKV5rWQAdMDsAW0b08UjjLQQUZBBYOEYCrDQ7Fkim0hgc+HZeUQAFJs4G2U4PDlLHbzhOCF32ACkAZQB5ADkAWgAlQ/YAQX2IgAdCAALqg+TGJSIACMAA51JodHpEABmIwmMx4DKMSKJRxIVwgdyebwRWFwwLBHB4QgkchGaJ4LKkCA4QQYNKbS4wbw1dgAIwgEA0ewAPuxgAN2DLdmgaCM0HB+WAAK5DAVkdgS1VgWAVRxQADc0tlsDU3AwKvVmtI2vYuv1DhgxoG/ntjpgBpdkSgEEY0xAAHV8GZQ3aBOxIBw0Hccgrlrd2NyWFcOCx2HB/QBrMzsMrcOxqVWbEEYqZIZCzfXcVVqOSWVW4cGQxTmAAs6JAGm0ugMGNIphiKbAabxzqQMLcHh4ZN8ACYqdQQrTwgyovRmVhWezMGl4zBFcrhGqNVqdXqvc6oL7/YGJKH2ENuLRhuqozatRAysneaneSsGYHkeZbUNwFYzHMXq1vWkQAKxghCIAKNCyhEj2yJIAiYGDliFjAcsCD2ASiDztOpI+Eg7b+EhzCwEwLBsMcPSjAAvGMjCxAA5AA9GgIw8ZsuhAjiXHFFKYAyiOabCBJspygmSrCDCrjsDxPHsMgACEdEwPm/qqnAoKmv4bopJEQxmNwSCgNEmhwKsYB4EqID+P4QA="}
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc', {
  reconnect: {
    attempts: 10, // [!code focus]
  }
})
```

#### reconnect.delay (optional)

- **Type:** `number`
- **Default:** `2_000`

Retry delay (in ms) between reconnect attempts.

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"b2214cc6617775ff7cb686b9a8695b3fb0301b96a65028697a06ea18a5d02824","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwCSWRgBUefAQyptugpADYqAGxhgA5mnxIAnFTSKtMBomrS4/JeoCWYXIgAMVRvkXdGNcomUBfCnRsJwJiMkpqOnMQAApuNTtuOABKdjtxWKxuXWE2UgctCnZmMAAzOy0AfmExSSsbNABhFgqtFNrxKV5rWQAdMDsAW0b08UjjLQQUZBBYOEYCrDQ7Fkim0hgc+HZeUQAFJs4G2U4PDlLHbzhOCF32ACkAZQB5ADkAWgAlQ/YAQX2IgAdCAALqg+TGJSIACMAA51JodHpEABmIwmMx4DKMSKJRxIVwgdyebwRWFwwLBHB4QgkchGaJ4LKkCA4QQYNKbS4wbw1dgAIwgEA0ewAPuxgAN2DLdmgaCM0HB+WAAK5DAVkdgS1VgWAVRxQADc0tlsDU3AwKvVmtI2vYuv1DhgxoG/ntjpgBpdkSgEEY0xAAHV8GZQ3aBOxIBw0Hccgrlrd2NyWFcOCx2HB/QBrMzsMrcOxqVWbEEYqZIZCzfXcVVqOSWVW4cGQxTmAAs6JAGm0ugMGNIphiKbAabxzqQMLcHh4ZN8ACYqdQQrTwgyovRmVhWezMGlzZbrRqtTq9V7nVBff7AxJQ+wDxh2LEHOwhqlBWYAO4wTTJ3mp3kVgzeMYEVOAy2obgKxmOYvVretInnAB9ZxULBCEQAUaFlCJHtkSQABWAchzwB9xwJRB52nUkfCQdt/Aw5hYCYFg2GOHpRgAXjGRhYgAcgAejQEYBM2XQgRxPjiilMAZRHNNhBk2V7xgC0MGEGEUNQ4oBIE9hkAAQiYmB839VU4FBU1/DdFJIiGMxuCQUBok0OBVjAPAlRAfx/CAA==="}
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc', {
  reconnect: {
    delay: 1_000, // [!code focus]
  }
})
```

### retryCount (optional)

- **Type:** `number`
- **Default:** `3`

The max number of times to retry when a request fails.

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"ab27affb107861b811f413bbb5ff8a6c7cf241c06026a75638c86fe516d60edc","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwCSWRgBUefAQyptugpADYqAGxhgA5mnxIAnFTSKtMBomrS4/JeoCWYXIgAMVRvkXdGNcomUBfCnRsJwJiMkpqOnMQAApuNTtuOABKdjtxWKxuXWE2UgctCnZmMAAzOy0AfmExSSsbNABhFgqtFNrxKV5rWQAdMDsAW0b08UjjLQQUZBBYOEYCrDQ7Fkim0hgc+HZeUQAFJs4G2U4PDlLHbzhOCF32ACkAZQB5ADkAWgAlQ/YAQX2IgAdCAALqg+TGJSIACMAA51JodHpEABmIwmMx4DKMSKJRxIVwgdyebwRWFwwLBHB4QgkchGaJ4LKkCA4QQYNKbLgYFoAVzAaBq7DAfKGACMyOwAD7sAWwCqOKCRKAQRjTEASfAwdhDbi0EViyWkdgQMqcYY7NB3bmkDAgyGKcwAFnRIA02l0SBhRKhphitt5EAFcndDicMLcHh4ZN8ACZ/BDidBQqU2MceqMALxjRixADkAHo0CNC9z8ECcfnisABux2IH+YLhABWYqFwvsZAAQmYsHYZTVfLgoIG/hSkSGZm4SFA0U0cFWYDwaAQ/n8QA=="}
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc', {
  retryCount: 5, // [!code focus]
})
```

### retryDelay (optional)

- **Type:** `number`
- **Default:** `150`

The base delay (in ms) between retries. By default, the Transport will use [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) (`~~(1 << count) * retryDelay`), which means the time between retries is not constant.

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"65a940f6dd44df315059309304c4ae0d41aac289ff655416903a9b809a06ba65","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwCSWRgBUefAQyptugpADYqAGxhgA5mnxIAnFTSKtMBomrS4/JeoCWYXIgAMVRvkXdGNcomUBfCnRsJwJiMkpqOnMQAApuNTtuOABKdjtxWKxuXWE2UgctCnZmMAAzOy0AfmExSSsbNABhFgqtFNrxKV5rWQAdMDsAW0b08UjjLQQUZBBYOEYCrDQ7Fkim0hgc+HZeUQAFJs4G2U4PDlLHbzhOCF32ACkAZQB5ADkAWgAlQ/YAQX2IgAdCAALqg+TGJSIACMAA51JodHpEABmIwmMx4DKMSKJRxIVwgdyebwRWFwwLBHB4QgkchGaJ4LKkCA4QQYNKbLgYAAiMDU3AwNXYYAArkMAEZkdgAH3YYrAsAqjigkSgEEY0xAEnwMHYkuS+tggow7FiDnYQ1SBrMAHcYJp2NyCvAQZDFOYACzokAabS6JAwolQ0wxF18gVCvEOJwwtweHhk3wAJn8EOJ0FCpTYxx6owAvGNGLEAOQAejQI3L3PwQJxpeKwAG7GdZlIkdNwmDrnY5fL7GQAEJmLB2GVNWK4KCBv4UpEhmZuEhQNFNHBVmA8GgEP5/EA"}
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc', {
  retryDelay: 100, // [!code focus]
})
```

### timeout (optional)

- **Type:** `number`
- **Default:** `10_000`

The timeout for async IPC requests.

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"3e60f35ccf323fd7346745e96cf1740689913ed66b67509708bfeefe180b7554","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwCSWRgBUefAQyptugpADYqAGxhgA5mnxIAnFTSKtMBomrS4/JeoCWYXIgAMVRvkXdGNcomUBfCnRsJwJiMkpqOnMQAApuNTtuOABKdjtxWKxuXWE2UgctCnZmMAAzOy0AfmExSSsbNABhFgqtFNrxKV5rWQAdMDsAW0b08UjjLQQUZBBYOEYCrDQ7Fkim0hgc+HZeUQAFJs4G2U4PDlLHbzhOCF32ACkAZQB5ADkAWgAlQ/YAQX2IgAdCAALqg+TGJSIACMAA51JodHpEABmIwmMx4DKMSKJRxIVwgdyebwRWFwwLBHB4QgkchGaJ4LKkCA4QQYNIrIYwCAAVzQNXYYD5QwARmR2AAfdh8sCwCqOKCRKAQRjTEASfAwTjDXkC9ixBzsIapdhlAS7OAYMCMUTidibACOfPgaDgQPYABEYGVuHy1EJ2DDnAB9ZwRyIKaEAFnRIA02l0SAA7BjSKYYtz9XIEw4nDC3B4eGTfAAmfwQ4nQUKlNjHHqjAC8Y0YsQA5AB6NAjTubXRAnHt4rAAbsXU8/lB5RhiOudidzvsZAAQmYsHNar5cFBA38KUiPOMSFA0U0cFWYDw7pA/n8QA"}
import { ipc } from 'viem/node'
// ---cut---
const transport = ipc('/tmp/reth.ipc', {
  timeout: 60_000, // [!code focus]
})
```
