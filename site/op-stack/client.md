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

To use the OP Stack functionality of Viem, you must extend your existing (or new) Viem Client with OP Stack Actions.

## Usage

### Layer 1 Extensions

```ts
import { createPublicClient, createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { walletActionsL1 } from 'viem/op-stack' // [!code hl]

const walletClient = createWalletClient({
  chain: mainnet,
  transport: http(),
}).extend(walletActionsL1()) // [!code hl]

const hash = await walletClient.depositTransaction({/* ... */})
```

### Layer 2 Extensions

```ts
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { publicActionsL2 } from 'viem/op-stack' // [!code hl]

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
}).extend(publicActionsL2()) // [!code hl]

const l1Gas = await publicClient.estimateL1Gas({/* ... */})
```

## Decorators

### `walletActionsL1`

A suite of [Wallet Actions](./actions/estimateL1Gas.md) for suited for development with **Layer 1** chains that interact with **Layer 2 (OP Stack)** chains.

```ts
import { walletActionsL1 } from 'viem/op-stack'
```

### `publicActionsL2`

A suite of [Public Actions](./actions/estimateL1Gas.md) for suited for development with **Layer 2 (OP Stack)** chains.

```ts
import { publicActionsL2 } from 'viem/op-stack'
```