---
description:  Getting started with the zkSync in Viem
---

# Getting started with zkSync

Viem provides first-class support for the [zkSync](https://zksync.io) chain.

zkSync is a Layer-2 protocol that scales Ethereum with cutting-edge ZK tech.

## Quick Start

### 1. Set up your Client & Transport

Firstly, set up your [Client](/docs/clients/intro) with a desired [Transport](/docs/clients/intro) & [zkSync Chain](./zksync/chains.md) and extend it with zkSync EIP712 actions.

```ts {5-8}
import { createWalletClient, custom } from 'viem'
import { zkSync } from 'viem/chains'
import { eip712Actions } from 'viem/chains/zksync'

const client = createWalletClient({
  chain: zkSync,
  transport: custom(window.ethereum),
}).extend(eip712Actions)
```

::: info
In a production app, it is highly recommended to pass through your authenticated RPC provider URL (Alchemy, Infura, Ankr, etc). If no URL is provided, viem will default to a public RPC provider. [Read more](/docs/clients/transports/http.html#usage).
:::

### 2. Send transactions using paymaster

Now that you have a Client set up, you can [send a transaction](./zksync/actions/sendTransaction.md) using a paymaster! [Read more](./zksync/client.md)

```ts
const hash = await client.sendTransaction({
  account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n,
  paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
  paymasterInput: '0x123abc...'
})
```
