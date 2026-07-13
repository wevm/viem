# Chains

The following ZKsync chains are supported in Viem:

```ts twoslash
import {
  zksync, // [!code hl]
  zksyncSepoliaTestnet, // [!code hl]
} from 'viem/chains'
```

## Configuration

Viem exports ZKsync's chain [formatters](/docs/chains/formatters) & [serializers](/docs/chains/serializers) via `chainConfig`. This is useful if you need to define another chain which is implemented on ZKsync.

```ts twoslash
// @noErrors
import { defineChain } from 'viem'
import { chainConfig } from 'viem/zksync'

export const zkStackExample = defineChain({
  ...chainConfig,
  name: 'ZKsync Example',
  // ...
})
```