# writeContract

Calls a write function on a contract, and returns its response (if returned).

A "write" function on a Solidity contract  modifies the state of the blockchain. These types of functions require gas to be executed, and hence a [Transaction](/docs/glossary/terms) is needed to be broadcast in order to change the state. 

Internally, `writeContract` uses a [Wallet Client](/docs/clients/wallet) to call the [`sendTransaction` action](/docs/actions/wallet/sendTransaction) with [ABI-encoded `data`](/docs/contract/encodeFunctionParams).

## Import

```ts
import { writeContract } from 'viem'
```

## Usage

::: code-group

```ts [example.ts]
import { writeContract } from 'viem'
import { walletClient } from './client'
import { wagmiAbi } from './abi'

const data = await writeContract(walletClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
})
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  ...
] as const;
```

```ts [client.ts]
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})
```

:::