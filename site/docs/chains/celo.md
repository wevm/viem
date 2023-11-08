# Celo

Viem provides first-class support for chains implemented on [Celo](https://celo.org/).

## Chains

The following Viem chains are implemented on Celo:

```ts
import {
  celo, // [!code hl]
  celoAlfajores, // [!code hl]
  celoCannoli, // [!code hl]
} from 'viem/chains'
```

### Configuration

Viem exports Celo's chain [formatters](/docs/chains/formatters) & [serializers](/docs/chains/serializers). This is useful if you need to define another chain which is implemented on Celo.

```ts
import { defineChain } from 'viem'
import { formattersCelo, serializersCelo } from 'viem/chains/celo'

export const celoExample = defineChain({
  name: 'Celo Example',
  // ...
  formatters: formattersCelo,
  serializers: serializersCelo,
})
```

## Utilities

