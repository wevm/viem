---
head:
  - - meta
    - property: og:title
      content: Client
  - - meta
    - name: description
      content: Setting up your Viem Client with the OP Stack
  - - meta
    - property: og:description
      content: Setting up your Viem Client with the OP Stack
---

# Client

To use the OP Stack functionality of Viem, you must configure your Client accordingly. This is just a matter of extending your existing (or new) Viem Client with OP Stack Actions.

## Usage

```ts
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { opStackPublicActions } from 'viem/chains/opStack' // [!code hl]

const client = createPublicClient({
  chain: base,
  transport: http(),
}).extend(opStackPublicActions) // [!code hl]

const l1Gas = await client.estimateL1Gas({/* ... */})
```

## Decorators

### `opStackPublicActions`

A suite of [Public Actions](./estimateL1Gas.md) for the OP Stack.

```ts
import { opStackPublicActions } from 'viem/chains/opStack'
```