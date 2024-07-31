# Extending Client with EIP-7702 [Setting up your Viem Client]

To use the experimental functionality of EIP-7702, you must extend your existing (or new) Viem Client with experimental EIP-7702 Actions.

## Overview

Here is an end-to-end overview of how to extend a Viem Client with EIP-7702 Actions. We will break it down into Steps below.

```ts twoslash
// @noErrors
import { createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { eip7702Actions } from 'viem/experimental'
 
const client = createWalletClient({
  chain: mainnet,
  transport: http(),
}).extend(eip7702Actions())
 
const authorization = await client.signAuthorization({/* ... */})
```

## Steps

### 1. Set up a Client

We will need to set up a Client to sign EIP-7702 Authorizations.

```ts twoslash
import { createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
 
const client = createWalletClient({
  chain: mainnet,
  transport: http(),
})
```

[See `createWalletClient` Docs](/docs/clients/wallet)

### 2. Extend with EIP-7702 Actions

Next, we will import the experimental EIP-7702 Actions and extend them on our Client.

```ts twoslash
import { createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { eip7702Actions } from 'viem/experimental' // [!code ++] // [!code focus]
 
const client = createWalletClient({
  chain: mainnet,
  transport: http(),
}).extend(eip7702Actions()) // [!code ++] // [!code focus]
```

### 3. Use EIP-7702 Actions

Now we can use EIP-7702 Actions like [`signAuthorization`](/experimental/eip7702/signAuthorization).

```ts twoslash
// @noErrors
import { createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { eip7702Actions } from 'viem/experimental' 
 
const client = createWalletClient({
  chain: mainnet,
  transport: http(),
}).extend(eip7702Actions()) 

const authorization = await client.signAuthorization({/* ... */}) // [!code ++] // [!code focus]
```