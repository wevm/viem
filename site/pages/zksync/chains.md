# Chains

The following zkSync chains are supported in Viem:

```ts twoslash
import {
  zkSync, // [!code hl]
  zkSyncSepoliaTestnet, // [!code hl]
} from 'viem/chains'
```

## Configuration

Viem exports zkSync's chain [formatters](/docs/chains/formatters) & [serializers](/docs/chains/serializers) via `chainConfig`. This is useful if you need to define another chain which is implemented on zkSync.

```ts twoslash
// @noErrors
import { defineChain } from 'viem'
import { chainConfig } from 'viem/zkSync'

export const opStackExample = defineChain({
  ...chainConfig,
  name: 'zkSync Example',
  // ...
})
```