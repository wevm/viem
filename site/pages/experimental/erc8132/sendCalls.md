---
description: Sends a batch of calls with ERC-8132 gas limit override support.
---

# sendCalls

Requests the connected wallet to send a batch of calls with [ERC-8132](https://github.com/ethereum/ERCs/pull/1485) gas limit override support.

ERC-8132 introduces a call-level capability for [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792) that allows apps to specify gas limits for individual calls in a `wallet_sendCalls` batch. This is useful when apps have better context for gas estimation than wallets.

## Usage

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './config'
import { parseEther } from 'viem'

const id = await walletClient.sendCalls({
  account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  calls: [
    {
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      data: '0xdeadbeef',
      gas: 100000n, // ERC-8132 gas limit override
    },
    {
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: parseEther('1'),
      // No gas specified - wallet will estimate
    },
  ],
})
```

```ts twoslash [config.ts] filename="config.ts"
import 'viem/window'
// ---cut---
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { erc8132Actions } from 'viem/experimental'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
}).extend(erc8132Actions())
```

:::

## Parameters

### calls[].gas

- **Type:** `bigint` (optional)

The ERC-8132 gas limit override for a specific call. When provided, this value will be sent to the wallet as a `gasLimitOverride` capability for that call.

If not provided, the wallet will estimate the gas for that call.

```ts twoslash
import { walletClient } from './config'

const id = await walletClient.sendCalls({
  account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  calls: [
    {
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      data: '0xdeadbeef',
      gas: 100000n, // [!code focus]
    },
  ],
})
```

:::tip
For other parameters (`account`, `calls`, `capabilities`, etc.), see the [core sendCalls documentation](/docs/actions/wallet/sendCalls).
:::

## How It Works

When you specify a `gas` value on a call, the ERC-8132 action transforms it into a `gasLimitOverride` call-level capability:

```ts
// Your call
{
  to: '0x...',
  data: '0xdeadbeef',
  gas: 100000n,
}

// Sent to wallet as
{
  to: '0x...',
  data: '0xdeadbeef',
  capabilities: {
    gasLimitOverride: {
      value: '0x186a0', // 100000 in hex
    },
  },
}
```

Wallets that support ERC-8132 will use the provided gas limit for that call's portion of the batch gas limit. Calls without a `gas` value will have their gas estimated by the wallet.
