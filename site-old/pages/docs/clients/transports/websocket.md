# WebSocket Transport [A function to create a WebSocket Transport for a Client]

The `webSocket` Transport connects to a JSON-RPC API via a WebSocket.

## Import

```ts twoslash
// @twoslash-cache: {"v":2,"hash":"c7da7d940f6711f2962b3a2a2b2ab26d8c087c008948fef5689889de883dfb83","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO4wARgGUIIgNYw0jQaVYB+RLzhpS7MAHMKvEZP7tTe3gHV5S1eoAqpZmDhYIpNADC1rbc+k6KympoHl4+fmgAOmDsALa+/jLOkeqU1MymCCjIILBwIsZY4pK5AaQwzDRwvMyOWa5ovEax6R1o+A2WkmAwYk1oEM28AFIKAPIAcgC0AEoACgG8AIKrAJIAdCAAuodUhsz+SACcVKwwZn1XVGjnpjmIILIR7bkcw0gADFQRP1PGIyFcAL4nEBWWB4VI9XjATJfKK8CECUgQFK8ADkRHYMBSuNyKXUzCQoDoNG8EjAeDQCAhEKAA"}
import { webSocket } from 'viem'
```

## Usage

```ts twoslash {4}
// @twoslash-cache: {"v":2,"hash":"01a2e4820a36d8738c2553d28e7196317ce30b277943dc544ba806d945538ce2","data":"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"}
import { createPublicClient, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet, 
  transport: webSocket('wss://1.rpc.thirdweb.com/...'), // [!code focus]
})
```

:::warning[Warning]
If no `url` is provided, then the transport will fall back to a public RPC URL on the chain. It is highly recommended to provide an authenticated RPC URL to prevent rate-limiting.
:::

## Parameters

### url

- **Type:** `string`

URL of the JSON-RPC API.

```ts twoslash
// @twoslash-cache: {"v":2,"hash":"1bacfc7fe0d4558899d5b68cb0f204da25898cbc0c65abeca990941bd857a13f","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwDqMAEYBlCIwDWMNABUefAQyptugpADYqAGxhgA5mnxIAnFTRbjCvF15x+2gwEswuRAAYqjfFrcjDTkiDoAvhTo2F4ExGSU1HQMiCAAFNz6btxwAJTsAO4S0nIKaQCupPoA/MJspB7GFOzMYABmbsa1osUy8koqzmoAwiwdxrnCYlJ9CspOLmgAOmBuALaLhb2l6tTcxggoyCCwcIwNWGhuLInDpDDcNHDs3D0zO5yDm2aPLSyewWeaAgL3YAClJAB5AByAFoAEoABWG7AAgoiAJIAOhAAF1cRobNpEABGAAcBiMpnMiCse1IdhSICK736iSyniQvhA/kCwQSpLJ4QJPOgsVabE+CzU7AAvFtWWUAOQFOBwRAAeg1JKxpCwjCxZjcpCgLKxzDWGqx1qVuUSawU3CQoGSRjg1zADgQ4XCQA=="}
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://1.rpc.thirdweb.com/...')
```

### keepAlive (optional)

- **Type:** `boolean | { interval?: number }`
- **Default:** `true`

Whether or not to send keep-alive ping messages.

```ts twoslash
// @twoslash-cache: {"v":2,"hash":"7adf97601a5b619025410a830f892d488e730b6f1c826c91a814470665cdc510","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwDqMAEYBlCIwDWMNABUefAQyptugpADYqAGxhgA5mnxIAnFTRbjCvF15x+2gwEswuRAAYqjfFrcjDTkiDoAvhTo2F4ExGSU1HQMiCAAFNz6btxwAJTsAO4S0nIKaQCupPoA/MJspB7GFOzMYABmbsa1osUy8koqzmoAwiwdxrnCYlJ9CspOLmgAOmBuALaLhb2l6tTcxggoyCCwcIwNWGhuLInDpDDcNHDs3D0zO5yDm2aPLSyewWeaAgL3YAClJAB5AByAFoAEoABWG7AAgoiAJIAOhAAF1cRobNpEABGAAcBiMpnMiCse1IdhSICK736iSyniQvhA/kCwQSpLJkWiODwhBI5GsyTwaSwpAgOEEGHy8hgWFRWRI3XEEAghl47AAPuxgCt2Ob2B4QkRMt0wOU1uIyEb2OUwLAOp4oABuFbhF1uj0eGBQRJQGSHEAifAKGOkdgCdiQDjA9hwIxQdiqrCwzJuEjsLCNdhreBwfbwHHWfaHZDHD3ccr6XZccq4fGErQpHQAFkpJjMlmrDPsqWzGvzuHcnNJfgCPH5oQATMLqDExfFJUl6DK5QqyJh8layDaasJ7Y7ncbAzBPSGwxG8IoY5awNbMuw0h4S3lOCD0+6WYwGquaajAJZlhWcBVnsBxIHWJy3o2zaJAAzN4AD63jYXiBIgJoxIAOyEf21JIBS9KMngx6kKe7LBkgJJznyISMQArOEeHMLATAsGwnwLGo7AALxbKyZQAOQFHAcCIAA9HJJJYqQWCMFiZhuKQUAslizBrHJWKGRJzSmmA5rjmBwjAK+776MIJJYdh7CROwCnsMgACE3HgW0MjlHAuJ+rkiSljYSCgMkRhwNcYAOAg4ThEAA=="}
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://1.rpc.thirdweb.com/...', {
  keepAlive: { interval: 1_000 }, // [!code focus]
})
```

### key (optional)

- **Type:** `string`
- **Default:** `"webSocket"`

A key for the Transport.

```ts twoslash
// @twoslash-cache: {"v":2,"hash":"ace287a39fdf5f646c30c123417a3d2f22e7bcbb1bb6f0428d66055a03052bda","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwDqMAEYBlCIwDWMNABUefAQyptugpADYqAGxhgA5mnxIAnFTRbjCvF15x+2gwEswuRAAYqjfFrcjDTkiDoAvhTo2F4ExGSU1HQMiCAAFNz6btxwAJTsAO4S0nIKaQCupPoA/MJspB7GFOzMYABmbsa1osUy8koqzmoAwiwdxrnCYlJ9CspOLmgAOmBuALaLhb2l6tTcxggoyCCwcIwNWGhuLInDpDDcNHDs3D0zO5yDm2aPLSyewWeaAgL3YAClJAB5AByAFoAEoABWG7AAgoiAJIAOhAAF1cRobNpEABGAAcBiMpnMiCse1IdhSICK736iSyniQvhA/kCwQSpLJkWiODwhBI5GsyTwaSwpAgOEEGHy8gw3XqjXYAB92OUwLAOp4oIkoDJDiBFPgYOxVewIG1OFa3iV+p8FmocYStCkdABWSkmMxIADM1ls9lSqvZHi8JL8AR4/NCACZwgSedBYq02G7VIJ2ABeLassoAcgKcDgiAA9NWSVjSFhGFizG5SFAWVjmGtq1i+6XmsB2Ct2DaYBhhKXMv4YGsMAPR7X2MgAITMWDsNoycpwXErcK5RJrBTcJCgZJGODXMAOBDhcJAA=="}
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://1.rpc.thirdweb.com/...', { 
  key: 'alchemy',  // [!code focus]
})
```

### methods (optional)

- **Type:** `{ include?: string[], exclude?: string[] }`

Methods to include or exclude from sending RPC requests.

```ts twoslash
// @twoslash-cache: {"v":2,"hash":"ca6067fbfa5dd070b1de4f5d4c20defa37b5d5fcce87a2e04a77355c004a3123","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwDqMAEYBlCIwDWMNABUefAQyptugpADYqAGxhgA5mnxIAnFTRbjCvF15x+2gwEswuRAAYqjfFrcjDTkiDoAvhTo2F4ExGSU1HQMiCAAFNz6btxwAJTsAO4S0nIKaQCupPoA/MJspB7GFOzMYABmbsa1osUy8koqzmoAwiwdxrnCYlJ9CspOLmgAOmBuALaLhb2l6tTcxggoyCCwcIwNWGhuLInDpDDcNHDs3D0zO5yDm2aPLSyewWeaAgL3YAClJAB5AByAFoAEoABWG7AAgoiAJIAOhAAF1cRobNpEABGAAcBiMpnMiCse1IdhSICK736iSyniQvhA/kCwQSpLJkWiODwhBI5GsyTwaSwpAgOEEGHyawUhCgcG6kM8kLaAB5gCt2Mb2B5GPpyrBuvVGshcewAD7scpgWAdTxQADcK3CjvYhrAJvYdHNlpg1q4tvtTpdbo8MC9PoAfH7YzB3QnElAZIcQABZNXQIEgs0W2DsATB2ih8tteVrKswRjlK4mdhIlH3ACO5XgaDgOMJWhSOgALJSTGYkAB2ay2eypVVmIvs+NIEl+AI8fmhABMwuoMTF8UlSXoMrlCrImHypbDEYaJjtqdd6fjUESmmJ07phknNNnelGTwO9YFXTlEF3Tc+RCJBR3CAkeWgWJWjYT4FjUdgAF4tlZMoAHICjgOBEAAelIkksVILBGCxMw3FIKAWSxZg1lIrEOPw5oA2NJd1RI/0jRNUCYGEZB8LVAB9OAjCgeZWCCK4WC49gJLMaTOjARQYigAARR5uEkohR3wgkhMiH1ckSJduCQUBkiMOBrjABwEHCcIgA"}
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://1.rpc.thirdweb.com/...', {
  methods: {
    include: ['eth_sendTransaction', 'eth_signTypedData_v4'],
  },
})
```

### name (optional)

- **Type:** `string`
- **Default:** `"WebSocket JSON-RPC"`

A name for the Transport

```ts twoslash
// @twoslash-cache: {"v":2,"hash":"f0eea27b9e9eb70bb6a1b388cf404a5a026a9236c3b9b59d0746c263e4e26652","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwDqMAEYBlCIwDWMNABUefAQyptugpADYqAGxhgA5mnxIAnFTRbjCvF15x+2gwEswuRAAYqjfFrcjDTkiDoAvhTo2F4ExGSU1HQMiCAAFNz6btxwAJTsAO4S0nIKaQCupPoA/MJspB7GFOzMYABmbsa1osUy8koqzmoAwiwdxrnCYlJ9CspOLmgAOmBuALaLhb2l6tTcxggoyCCwcIwNWGhuLInDpDDcNHDs3D0zO5yDm2aPLSyewWeaAgL3YAClJAB5AByAFoAEoABWG7AAgoiAJIAOhAAF1cRobNpEABGAAcBiMpnMiCse1IdhSICK736iSyniQvhA/kCwQSpLJkWiODwhBI5GsyTwaSwpAgOEEGHyYG4axg3XqjXYAB92OUwLAOp4oIkoDJDiBFPgYOxVer2BA2pwbW8Sv1Pgs1DjCVoUjoAKyUkxmJAAFmstnsqXtuHcnNJfgCPH5oQATOECTzoLFWmxPapBOwALxbVllADkBTgcEQAHo6ySsaQsIwsWY3KQoCyscw1nWsYOK81gOwVuw7WqYMIK6j9P4YGsMG7ZhxEfKiG5YKRhxOG+xkABCZiwdhtGTlOC4lbhXKJdU2JCgZJGODXMAOBDhcJAA"}
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://1.rpc.thirdweb.com/...', { 
  name: 'Alchemy WebSocket Provider',  // [!code focus]
})
```

### reconnect (optional)

- **Type:** `boolean | { maxAttempts?: number, delay?: number }`
- **Default:** `true`

Whether or not to attempt to reconnect on socket failure.

```ts twoslash
// @twoslash-cache: {"v":2,"hash":"84d474e2f7278c52ed78651b535038d872cbf1684881b654b401ff85b364dc97","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwDqMAEYBlCIwDWMNABUefAQyptugpADYqAGxhgA5mnxIAnFTRbjCvF15x+2gwEswuRAAYqjfFrcjDTkiDoAvhTo2F4ExGSU1HQMiCAAFNz6btxwAJTsAO4S0nIKaQCupPoA/MJspB7GFOzMYABmbsa1osUy8koqzmoAwiwdxrnCYlJ9CspOLmgAOmBuALaLhb2l6tTcxggoyCCwcIwNWGhuLInDpDDcNHDs3D0zO5yDm2aPLSyewWeaAgL3YAClJAB5AByAFoAEoABWG7AAgoiAJIAOhAAF1cRobNpEABGAAcBiMpnMiCse1IdhSICK736iSyniQvhA/kCwQSpLJkWiODwhBI5GsyTwaSwpAgOEEGHy91aALQ3XEEAghl47AAPuxgCt2KaXmgaBs0HBumBymtxGQDexymBYB1PFAANwms2wfTcDC2+2O0jO13ujwwb0rcLht0wD3RxJQGSHEAifAKLNhgTsSAcYHmy2XTgg1X/GDBdgsdhwWYcNrcNz6SowHHWfaHZDHd3ccr6XZccq4fGErQpHQAFkpJjMlk7DPsqQrYHV7KjSBJfgCPH5oQATOECTzoLFWmxPgs1OwALxbVllADkBTgcEQAHoPySsaQsIwsTMNxSCgFksWYNYPyxaCn2aY0wFNVd1WEJt9DgGBmi/dhkAAQmYWB2DaGRyjgXFY1yRI1gUbgkFAZIjDga4wAcBBwnCIA==="}
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://1.rpc.thirdweb.com/...', {
  reconnect: false, // [!code focus]
})
```

#### reconnect.attempts (optional)

- **Type:** `number`
- **Default:** `5`

The max number of times to attempt to reconnect.

```ts twoslash
// @twoslash-cache: {"v":2,"hash":"7ffbffaa5a1bbe2719cc45a795597b793f8b88fabae1f29db82f6c791566fae9","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwDqMAEYBlCIwDWMNABUefAQyptugpADYqAGxhgA5mnxIAnFTRbjCvF15x+2gwEswuRAAYqjfFrcjDTkiDoAvhTo2F4ExGSU1HQMiCAAFNz6btxwAJTsAO4S0nIKaQCupPoA/MJspB7GFOzMYABmbsa1osUy8koqzmoAwiwdxrnCYlJ9CspOLmgAOmBuALaLhb2l6tTcxggoyCCwcIwNWGhuLInDpDDcNHDs3D0zO5yDm2aPLSyewWeaAgL3YAClJAB5AByAFoAEoABWG7AAgoiAJIAOhAAF1cRobNpEABGAAcBiMpnMiCse1IdhSICK736iSyniQvhA/kCwQSpLJkWiODwhBI5GsyTwaSwpAgOEEGHy91aALQ3XEEAghl47AAPuxgCt2KaXmgaBs0HBumBymtxGQDexymBYB1PFAANwms2wfTcDC2+2O0jO13ujwwb0rcLht0wD3RxJQGSHEAifAKLNhgTsSAcYHmy2XTgg1X/GDBdgsdhwWYcNrcNz6SowHHWfaHZDHd3ccr6XZccq4fGErQpHQAFkpJjMlk7DPsqQrYHV7KjSBJfgCPH5oQATMLqDExfFJUl6DK5QqyJh8o8S9bgw6nYaI4mo1AU2m8Ios+wazcLQ6z2vmIZOhAbTsKu6rXGAxYwFacAdnsBxID2JyJv2g6JAArHiBIgJoxJktuICGHONIUvSjJ4I+SGXAg7icogB47nyIRIFO4REcwsBMCwbCfAsajsAAvFsrJlAA5AUcBwIgAD0SkklipBYIwWJmG4pBQCyWLMGsSlYqZMnNMaCEwVWlbBMIllmohyHCCSvjsCp7DIAAhPxMDsG0MjlHAuK+uEsa5IkawKNwSCgMkRhwPBDgIOE4RAA="}
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://1.rpc.thirdweb.com/...', {
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
// @twoslash-cache: {"v":2,"hash":"a6a747ef0bbbab4257fac8ecb2695bbd9b215884e09ecaa11fb7b35f4c21c9f5","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwDqMAEYBlCIwDWMNABUefAQyptugpADYqAGxhgA5mnxIAnFTRbjCvF15x+2gwEswuRAAYqjfFrcjDTkiDoAvhTo2F4ExGSU1HQMiCAAFNz6btxwAJTsAO4S0nIKaQCupPoA/MJspB7GFOzMYABmbsa1osUy8koqzmoAwiwdxrnCYlJ9CspOLmgAOmBuALaLhb2l6tTcxggoyCCwcIwNWGhuLInDpDDcNHDs3D0zO5yDm2aPLSyewWeaAgL3YAClJAB5AByAFoAEoABWG7AAgoiAJIAOhAAF1cRobNpEABGAAcBiMpnMiCse1IdhSICK736iSyniQvhA/kCwQSpLJkWiODwhBI5GsyTwaSwpAgOEEGHy91aALQ3XEEAghl47AAPuxgCt2KaXmgaBs0HBumBymtxGQDexymBYB1PFAANwms2wfTcDC2+2O0jO13ujwwb0rcLht0wD3RxJQGSHEAifAKLNhgTsSAcYHmy2XTgg1X/GDBdgsdhwWYcNrcNz6SowHHWfaHZDHd3ccr6XZccq4fGErQpHQAFkpJjMlk7DPsqQrYHV7KjSBJfgCPH5oQATMLqDExfFJUl6DK5QqyJh8v7A8GHU7DRHE1GoCm03hFFn2I+GDsGkHjsGseTsI6aBFEY7Cruq1xgMWMBWnAHZ7AcSA9icib9oOiQHgA+t4JF4gSICaMSZLbiAhhzjSACsi6MnggEbpyiAHjufIhEgU7hORzCwEwLBsJ8CxqOwAC8WysmUADkBRwHAiAAPSqSSWKkFgjBYmYbikFALJYswayqViFnyc0xpIXBVaVsEwg2WaAEwAGGDCCSxEkc06nsMgACEQkwOwbQyOUcC4r64SxrkiRrAo3BIKAyRGHAiEOAg4ThEAA==="}
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://1.rpc.thirdweb.com/...', {
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
// @twoslash-cache: {"v":2,"hash":"77158f458e3f466fbe15598a8df80338aa6587cb5e1ccdbfd7cc2abd22076793","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwDqMAEYBlCIwDWMNABUefAQyptugpADYqAGxhgA5mnxIAnFTRbjCvF15x+2gwEswuRAAYqjfFrcjDTkiDoAvhTo2F4ExGSU1HQMiCAAFNz6btxwAJTsAO4S0nIKaQCupPoA/MJspB7GFOzMYABmbsa1osUy8koqzmoAwiwdxrnCYlJ9CspOLmgAOmBuALaLhb2l6tTcxggoyCCwcIwNWGhuLInDpDDcNHDs3D0zO5yDm2aPLSyewWeaAgL3YAClJAB5AByAFoAEoABWG7AAgoiAJIAOhAAF1cRobNpEABGAAcBiMpnMiCse1IdhSICK736iSyniQvhA/kCwQSpLJkWiODwhBI5GsyTwaSwpAgOEEGHy9y4GFG5TAaG6YHKa3EZHYAB92JrYB1PFBElAZIcQIp8DB2GtuLR2Lr9YaIG1OOt4JwQarSBgcYStCkdAAWSkmMxIEncomMvBB9UQTW7DleEl+AI8fmhABM4QJPOgsVabE+CzU7AAvFtWWUAOQFOBwRAAek7JKxpCwjCxZjcpCgLKxzDWnaxM+bzWAK3Y7FTGq1wgArM1u+xkABCZiwdhtGTlOC4lbhXKJNYKbhIUDJIxwa5gBwIcLhIA="}
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://1.rpc.thirdweb.com/...', {
  retryCount: 5, // [!code focus]
})
```

### retryDelay (optional)

- **Type:** `number`
- **Default:** `150`

The base delay (in ms) between retries. By default, the Transport will use [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) (`~~(1 << count) * retryDelay`), which means the time between retries is not constant.

```ts twoslash
// @twoslash-cache: {"v":2,"hash":"312c3c0e578d593c0ba3ced6f7ae85acf1c75984362dfc1d1c171308c872e39a","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwDqMAEYBlCIwDWMNABUefAQyptugpADYqAGxhgA5mnxIAnFTRbjCvF15x+2gwEswuRAAYqjfFrcjDTkiDoAvhTo2F4ExGSU1HQMiCAAFNz6btxwAJTsAO4S0nIKaQCupPoA/MJspB7GFOzMYABmbsa1osUy8koqzmoAwiwdxrnCYlJ9CspOLmgAOmBuALaLhb2l6tTcxggoyCCwcIwNWGhuLInDpDDcNHDs3D0zO5yDm2aPLSyewWeaAgL3YAClJAB5AByAFoAEoABWG7AAgoiAJIAOhAAF1cRobNpEABGAAcBiMpnMiCse1IdhSICK736iSyniQvhA/kCwQSpLJkWiODwhBI5GsyTwaSwpAgOEEGHy9y4GAAIjB9NwMN0wOU1uIyOwAD7scpgWAdTxQRJQGSHECKfAwdjiHKu2DajDsNIedhrPJuhRFIzsVUNeA4wlaFI6AAslJMZiQJO5RMZeAjGq1OvZHi8JL8AR4/NCACZwgSedBYq02J8Fmp2ABeLassoAcgKcDgiAA9P2SVjSFhGFizG5SFAWVjmGt+1il53msAVuxwwpSDnvcI0752IP2MgAITMWDsNoycpwXErcK5RJrBTcJCgZJGODXMAOBDhcJAA=="}
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://1.rpc.thirdweb.com/...', {
  retryDelay: 100, // [!code focus]
})
```

### timeout (optional)

- **Type:** `number`
- **Default:** `10_000`

The timeout for async WebSocket requests.

```ts twoslash
// @twoslash-cache: {"v":2,"hash":"7d6afee33f1d22a1e5f03ff11449ff9761c38ab1d1e0419a7163c33cba7c9435","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAjVIENWsJSaROwDqMAEYBlCIwDWMNABUefAQyptugpADYqAGxhgA5mnxIAnFTRbjCvF15x+2gwEswuRAAYqjfFrcjDTkiDoAvhTo2F4ExGSU1HQMiCAAFNz6btxwAJTsAO4S0nIKaQCupPoA/MJspB7GFOzMYABmbsa1osUy8koqzmoAwiwdxrnCYlJ9CspOLmgAOmBuALaLhb2l6tTcxggoyCCwcIwNWGhuLInDpDDcNHDs3D0zO5yDm2aPLSyewWeaAgL3YAClJAB5AByAFoAEoABWG7AAgoiAJIAOhAAF1cRobNpEABGAAcBiMpnMiCse1IdhSICK736iSyniQvhA/kCwQSpLJkWiODwhBI5GsyTwaSwpAgOEEGHyVzWMAg5TQ3TA5TW4jI7AAPuxymBYB1PFBElAZIcQIp8DBOOt1Zr2GkPOw1nl2G0BC84BgwIw3iV+ux7gBHcrwNBwLHsAAiMDa3HK+iE7BJ3gA+t584lNMSdAAWSkmMxIADs1ls9lSqtduw5XhJfgCPH5oQATOECTzoLFWmxPgs1OwALxbVllADkBTgcEQAHplySsaQsIwsWY3KQoCyscw1susWfZ81gCt2M61RrMzpc/nfOxV+xkABCZiwX0ycpwXEVnCXJEjVGwkFAZIjDga4wAcBBwnCIA="}
import { webSocket } from 'viem'
// ---cut---
const transport = webSocket('wss://1.rpc.thirdweb.com/...', {
  timeout: 60_000, // [!code focus]
})
```
