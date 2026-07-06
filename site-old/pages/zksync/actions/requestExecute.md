---
description: Requests execution of a L2 transaction from L1.
---

# requestExecute

Requests execution of a L2 transaction from L1.

## Usage

:::code-group

```ts [example.ts]
import { account, walletClient, zksyncClient } from './config'

const hash = await walletClient.requestExecute({
  account,
  client: zksyncClient,
  contractAddress: await zksyncClient.getBridgehubContractAddress(),
  calldata: '0x',
  l2Value: 7_000_000_000n,
  l2GasLimit: 900_000n
})
```

```ts [config.ts]
import { createWalletClient, createPublicClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { zksync, mainnet } from 'viem/chains'
import { publicActionsL2, walletActionsL1 } from 'viem/zksync'

export const zksyncClient = createPublicClient({
  chain: zksync,
  transport: custom(window.ethereum)
}).extend(publicActionsL2())

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
}).extend(walletActionsL1())

// JSON-RPC Account
export const [account] = await walletClient.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::

### Account Hoisting

If you do not wish to pass an `account` to every `requestExecute`, you can also hoist the Account on the Wallet Client (see `config.ts`).

[Learn more](/docs/clients/wallet#account).

:::code-group

```ts [example.ts]
import { walletClient, zksyncClient } from './config'
 
const hash = await walletClient.requestExecute({
  client: zksyncClient,
  contractAddress: await zksyncClient.getBridgehubContractAddress(),
  calldata: '0x',
  l2Value: 7_000_000_000n,
  l2GasLimit: 900_000n
})
```

```ts [config.ts (JSON-RPC Account)]
import { createWalletClient, custom } from 'viem'
import { zksync } from 'viem/chains'
import { publicActionsL2, walletActionsL1 } from 'viem/zksync'

export const zksyncClient = createPublicClient({
  chain: zksync,
  transport: custom(window.ethereum)
}).extend(publicActionsL2())

// Retrieve Account from an EIP-1193  Provider. // [!code focus]
const [account] = await window.ethereum.request({  // [!code focus]
  method: 'eth_requestAccounts' // [!code focus]
}) // [!code focus]

export const walletClient = createWalletClient({
  account,
  transport: custom(window.ethereum) // [!code focus]
}).extend(walletActionsL1())
```

```ts [config.ts (Local Account)]
import { createWalletClient, custom } from 'viem'
import { zksync } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { publicActionsL2, walletActionsL1 } from 'viem/zksync'

export const zksyncClient = createPublicClient({
  chain: zksync,
  transport: custom(window.ethereum)
}).extend(publicActionsL2())

export const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'), // [!code focus]
  transport: custom(window.ethereum)
}).extend(walletActionsL1())
```

:::

## Returns

[`Hash`](/docs/glossary/types#hash)

The [Transaction](/docs/glossary/terms#transaction) hash.

## Parameters

### client

- **Type:** `Client`

The L2 client for fetching data from L2 chain.

```ts
const hash = await walletClient.requestExecute({
  client: zksyncClient, // [!code focus]
  contractAddress: await zksyncClient.getBridgehubContractAddress(),
  calldata: '0x',
  l2Value: 7_000_000_000n,
  l2GasLimit: 900_000n
})
```

### contractAddress

- **Type:** `Address`

The L2 contract to be called.

```ts
const hash = await walletClient.requestExecute({
  client: zksyncClient, 
  contractAddress: await zksyncClient.getBridgehubContractAddress(), // [!code focus]
  calldata: '0x',
  l2Value: 7_000_000_000n,
  l2GasLimit: 900_000n
})
```

### calldata 

- **Type:** `Hex`

The input of the L2 transaction.

```ts
const hash = await walletClient.requestExecute({
  client: zksyncClient,
  contractAddress: await zksyncClient.getBridgehubContractAddress(), 
  calldata: '0x', // [!code focus]
  l2Value: 7_000_000_000n,
  l2GasLimit: 900_000n
})
```

### l2Value (optional)

- **Type:** `bigint`

The `msg.value` of L2 transaction.

```ts
const hash = await walletClient.requestExecute({
  client: zksyncClient,
  contractAddress: await zksyncClient.getBridgehubContractAddress(), 
  calldata: '0x', 
  l2Value: 7_000_000_000n, // [!code focus]
  l2GasLimit: 900_000n
})
```

### l2GasLimit (optional)

- **Type:** `bigint`

Maximum amount of L2 gas that transaction can consume during execution on L2.

```ts
const hash = await walletClient.requestExecute({
  client: zksyncClient,
  contractAddress: await zksyncClient.getBridgehubContractAddress(), 
  calldata: '0x', 
  l2Value: 7_000_000_000n, 
  l2GasLimit: 900_000n // [!code focus]
})
```

### mintValue (optional)

- **Type:** `bigint`

The amount of base token that needs to be minted on non-ETH-based L2.

```ts
const hash = await walletClient.requestExecute({
  client: zksyncClient,
  contractAddress: await zksyncClient.getBridgehubContractAddress(), 
  calldata: '0x', 
  l2Value: 7_000_000_000n, 
  l2GasLimit: 900_000n,
  mintValue: 100_000n // [!code focus]
})
```

### factoryDeps (optional)

- **Type:** `Hex[]`

An array of L2 bytecodes that will be marked as known on L2.

```ts
const hash = await walletClient.requestExecute({
  client: zksyncClient,
  contractAddress: await zksyncClient.getBridgehubContractAddress(), 
  calldata: '0x', 
  l2Value: 7_000_000_000n, 
  l2GasLimit: 900_000n,
  factoryDeps: ['0x...'] // [!code focus]
})
```

### operatorTip (optional)

- **Type:** `bigint`

The tip the operator will receive on top of the base cost of the transaction. 
Currently, ZKsync node do not consider this tip.

```ts
const hash = await walletClient.requestExecute({
  client: zksyncClient,
  contractAddress: await zksyncClient.getBridgehubContractAddress(), 
  calldata: '0x', 
  l2Value: 7_000_000_000n, 
  l2GasLimit: 900_000n,
  operatorTip: 100_000n // [!code focus]
})
```

### gasPerPubdataByte (optional)

- **Type:** `bigint`

The L2 gas price for each published L1 calldata byte.

```ts
const hash = await walletClient.requestExecute({
  client: zksyncClient,
  contractAddress: await zksyncClient.getBridgehubContractAddress(), 
  calldata: '0x', 
  l2Value: 7_000_000_000n, 
  l2GasLimit: 900_000n,
  gasPerPubdataByte: 250_000_000_000n // [!code focus]
})
```

### refundRecipient (optional)

- **Type:** `Address`
- **Default:** `walletClient.account`

The address on L2 that will receive the refund for the transaction.
If the transaction fails, it will also be the address to receive `l2Value`.

```ts
const hash = await walletClient.requestExecute({
  client: zksyncClient,
  contractAddress: await zksyncClient.getBridgehubContractAddress(), 
  calldata: '0x', 
  l2Value: 7_000_000_000n, 
  l2GasLimit: 900_000n,
  refundRecipient: '0x...' // [!code focus]
})
```

### chain (optional)

- **Type:** [`Chain`](/docs/glossary/types#chain)
- **Default:** `walletClient.chain`

The target chain. If there is a mismatch between the wallet's current chain & the target chain, an error will be thrown.

```ts
import { zksync } from 'viem/chains' // [!code focus]

const hash = await walletClient.requestExecute({
  chain: zksync, // [!code focus]
  client: zksyncClient,
  contractAddress: await zksyncClient.getBridgehubContractAddress(),
  calldata: '0x',
  l2Value: 7_000_000_000n,
  l2GasLimit: 900_000n
})
```