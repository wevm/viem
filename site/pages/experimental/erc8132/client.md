# Extending Client with ERC-8132 Actions [Setting up your Viem Client]

To use the experimental functionality of [ERC-8132](https://github.com/ethereum/ERCs/pull/1485), you can extend your existing (or new) Viem Client with experimental [ERC-8132](https://github.com/ethereum/ERCs/pull/1485) Actions.

ERC-8132 introduces a capability that allows apps to specify gas limits for individual calls in an [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792) `wallet_sendCalls` batch.

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { erc8132Actions } from 'viem/experimental' // [!code focus]

const client = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
}).extend(erc8132Actions()) // [!code focus]

const id = await client.sendCalls({
  account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  calls: [
    {
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      data: '0xdeadbeef',
      gas: 100000n, // ERC-8132 gas limit override
    },
  ],
})
```
