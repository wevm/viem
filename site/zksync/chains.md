# Chains

The following zkSync chains are supported in Viem:

```ts
import {
  zkSync, // [!code hl]
  zkSyncSepoliaTestnet, // [!code hl]
} from 'viem/chains'
```

<!-- ## Configuration

Viem exports zkSync chain [formatters](/docs/chains/formatters) & [serializers](/docs/chains/serializers) via `chainConfig`. This is useful if you need to define another chain which is implemented on the OP Stack.

```ts
import { defineChain } from 'viem/chains/zksync'
import { chainConfig } from 'viem/op-stack'

export const opStackExample = defineChain({
  ...chainConfig,
  name: 'OP Stack Example',
  // ...
})
``` -->
