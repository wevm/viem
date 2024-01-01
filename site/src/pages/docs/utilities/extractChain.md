# extractChain

Extracts a type-safe chain by ID from a set of chains.

## Usage

```ts
import { extractChain } from 'viem'
import { mainnet, base, optimism, zora } from 'viem/chains'

const optimism = extractChain({
  chains: [mainnet, base, optimism, zora],
  id: 10,
})

optimism.id
//       ^? (property) id: 10
optimism.name
//       ^? (property) name: "OP Mainnet"
```

It is also possible to use **all chains** from the `viem/chains` module:

```ts
import { extractChain } from 'viem'
import { mainnet, base, optimism, zora } from 'viem/chains' // [!code --]
import * as chains from 'viem/chains' // [!code ++]

const optimism = extractChain({
  chains: [mainnet, base, optimism, zora], // [!code --]
  chains: Object.values(chains), // [!code ++]
  id: 10,
})

optimism.id
//       ^? (property) id: 10
optimism.name
//       ^? (property) name: "OP Mainnet"
```

:::warning
By importing all chains from `viem/chains`, this will significantly increase the size of your bundle. It is only recommended to use this method where bundle size is not a concern (ie. server-side, scripts, etc).
:::

## Returns

- **Type:** `Chain` (inferred)

The extracted chain.

## Parameters

### chains

- **Type:** `readonly Chain[]`

The set of chains where the chain will be extracted from.

### id

- **Type:** `number`

The ID of the chain to extract.