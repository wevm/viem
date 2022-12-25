# setLoggingEnabled

Enable or disable logging on the test node network.

## Import 

```ts
import { setLoggingEnabled } from 'viem'
```

## Usage

```ts
import { setLoggingEnabled } from 'viem'
import { testClient } from '.'
 
await setLoggingEnabled(testClient, true) // [!code focus]
```