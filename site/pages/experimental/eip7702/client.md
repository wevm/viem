# Extending Client with EIP-7702 [Setting up your Viem Client]

To use the experimental functionality of EIP-7702, you must extend your existing (or new) Viem Client with experimental EIP-7702 Actions.

## Overview

Here is an end-to-end overview of how to extend a Viem Client with EIP-7702 Actions. We will break it down into Steps below.

```ts twoslash
// @noErrors
import { createWalletClient, http } from 'viem'
import { anvil } from 'viem/chains'
import { eip7702Actions } from 'viem/experimental'
 
const walletClient = createWalletClient({
  chain: anvil,
  transport: http(),
}).extend(eip7702Actions())
 
const authorization = await walletClient.signAuthorization({/* ... */})
```

:::warning
EIP-7702 is currently not supported on Ethereum Mainnet or Testnets. For this example, we are using the `anvil` chain which interfaces with an [Anvil node](https://book.getfoundry.sh/anvil/) (a local Ethereum network).
:::

## Steps

### 0. Install & Run Anvil

EIP-7702 is currently not supported on Ethereum Mainnet or Testnets, so let's set up an EIP-7702 compatible network. We will use an [Anvil node](https://book.getfoundry.sh/anvil/) for this example. If you are using an existing EIP-7702 compatible network, you can skip this step.

```bash
curl -L https://foundry.paradigm.xyz | bash
anvil --hardfork prague
```

### 1. Set up a Client

We will need to set up a Client to sign EIP-7702 Authorizations.

```ts twoslash
import { createWalletClient, http } from 'viem'
import { anvil } from 'viem/chains'
 
const walletClient = createWalletClient({
  chain: anvil,
  transport: http(),
})
```

[See `createWalletClient` Docs](/docs/clients/wallet)

### 2. Extend with EIP-7702 Actions

Next, we will import the experimental EIP-7702 Actions and extend them on our Client.

```ts twoslash
import { createWalletClient, http } from 'viem'
import { anvil } from 'viem/chains'
import { eip7702Actions } from 'viem/experimental' // [!code focus]
 
const walletClient = createWalletClient({
  chain: anvil,
  transport: http(),
}).extend(eip7702Actions()) // [!code focus]
```

### 3. Use EIP-7702 Actions

Now we can use EIP-7702 Actions like [`signAuthorization`](/experimental/eip7702/signAuthorization).

```ts twoslash
// @noErrors
import { createWalletClient, http } from 'viem'
import { anvil } from 'viem/chains'
import { eip7702Actions } from 'viem/experimental' 
 
const walletClient = createWalletClient({
  chain: anvil,
  transport: http(),
}).extend(eip7702Actions()) 

const authorization = await walletClient.signAuthorization({/* ... */}) // [!code focus]
```