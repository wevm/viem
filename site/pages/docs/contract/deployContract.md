---
description: Deploys a contract to the network, given bytecode & constructor arguments.
---

# deployContract

Deploys a contract to the network, given bytecode & constructor arguments.

## Usage

:::code-group

```ts [example.ts]
import { wagmiAbi } from './abi'
import { account, walletClient } from './config'

const hash = await walletClient.deployContract({
  abi,
  account,
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
})
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  ...
] as const;
```

```ts [client.ts]
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})

// JSON-RPC Account
export const [account] = await walletClient.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::

### Deploying with Constructor Args

:::code-group

```ts [example.ts] {8}
import { deployContract } from 'viem'
import { wagmiAbi } from './abi'
import { account, walletClient } from './config'

const hash = await walletClient.deployContract({
  abi,
  account,
  args: [69420],
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
})
```

```ts [abi.ts] {4}
export const wagmiAbi = [
  ...
  {
    inputs: [{ name: "x", type: "uint32" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  ...
] as const;
```

```ts [client.ts]
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})

// JSON-RPC Account
export const [account] = await walletClient.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::

## Returns

[`Hash`](/docs/glossary/types#hash)

The [Transaction](/docs/glossary/terms#transaction) hash.

## Parameters

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

```ts
const hash = await walletClient.deployContract({
  abi: wagmiAbi, // [!code focus]
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
})
```

### account

- **Type:** `Account | Address`

The Account to deploy the contract from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const hash = await walletClient.deployContract({
  abi: wagmiAbi, 
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
})
```

### bytecode

- **Type:** [`Hex`](/docs/glossary/types#hex)

The contract's bytecode.

```ts
const hash = await walletClient.deployContract({
  abi: wagmiAbi,
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...', // [!code focus]
})
```

### args (if required)

- **Type:** Inferred from ABI.

Constructor arguments to call upon deployment.

```ts
const hash = await walletClient.deployContract({
  abi: wagmiAbi,
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
  args: [69] // [!code focus]
})
```

## Live Example

Check out the usage of `deployContract` in the live [Deploying Contracts Example](https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts_deploying-contracts) below.

<iframe frameBorder="0" width="100%" height="500px" src="https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts_deploying-contracts?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>
