# setLoggingEnabled

Enable or disable logging on the test node network.

## Import 

```ts
import { setLoggingEnabled } from 'viem/test'
```

## Usage

```ts
import { setLoggingEnabled } from 'viem/test'
import { testClient } from '.'
 
await setLoggingEnabled(testClient, true) // [!code focus]
```