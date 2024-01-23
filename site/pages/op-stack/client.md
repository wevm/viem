# Client [Setting up your Viem Client with the OP Stack]

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

## Extensions

### `walletActionsL1`

A suite of [Wallet Actions](/op-stack/actions/estimateL1Gas) for suited for development with **Layer 1** chains that interact with **Layer 2 (OP Stack)** chains.

```ts
import { walletActionsL1 } from 'viem/op-stack'
```

### `publicActionsL1`

A suite of [Public Actions](/op-stack/actions/getTimeToProve) suited for development with **Layer 1** chains. These actions provide functionalities specific to public clients operating at the Layer 1 level, enabling them to interact seamlessly with Layer 2 protocols.

```ts
import { publicActionsL1 } from 'viem/op-stack'
```

### `walletActionsL2`

A suite of [Wallet Actions](/op-stack/actions/estimateL1Fee) suited for development with **Layer 2 (OP Stack)** chains. These actions are tailored for wallets operating on Layer 2, providing advanced features and integrations necessary for Layer 2 financial operations.

```ts
import { walletActionsL2 } from 'viem/op-stack'
```

### `publicActionsL2`

A suite of [Public Actions](/op-stack/actions/estimateL1Gas) for suited for development with **Layer 2 (OP Stack)** chains.

```ts
import { publicActionsL2 } from 'viem/op-stack'
```
