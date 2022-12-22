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
 
await setLoggingEnabled(testClient, { // [!code focus:4]
  enabled: true
})
```

## Configuration

### enabled

- **Type:** `boolean`

Whether or not to disable logging.

```ts
await setLoggingEnabled(testClient, {
  enabled: false // [!code focus]
})
```