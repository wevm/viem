---
description: Setting up your zkSync Viem Client
---

# Client

To be able to send transactions and use contracts on the zkSync blockchain you must create a Viem client

## Usage

### Client set up

```ts
import { createPublicClient, createWalletClient, custom } from 'viem'
import { zkSync } from 'viem/chains'
import { eip712Actions } from 'viem/chains/zksync'
 
const walletClient = createWalletClient({
  chain: zkSync,
  transport: custom(window.ethereum),
}).extend(eip712Actions)

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

### Sending transactions using paymaster

[Read more](./actions/sendTransaction.md)

```ts
const hash = await walletClient.sendTransaction({
  account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n,
  paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
  paymasterInput: '0x123abc...'
})
```

### Calling contracts

[Read more](./actions/writeContract.md)

```ts
import { simulateContract } from 'viem/contract'

const { request } = await publicClient.simulateContract(walletClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
  functionName: 'mint',
  args: [69420],
}
const hash = await walletClient.writeContract(request)
```
