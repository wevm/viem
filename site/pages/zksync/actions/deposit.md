---
description: Transfers the specified token from the associated account on the L1 network to the target account on the L2 network.
---

# deposit

Transfers the specified token from the associated account on the L1 network to the target account on the L2 network.
The token can be either ETH or any ERC20 token. For ERC20 tokens, enough approved tokens must be associated with
the specified L1 bridge (default one or the one defined in `bridgeAddress`).
In this case, depending on is the chain ETH-based or not `approveToken` or `approveBaseToken`
can be enabled to perform token approval. If there are already enough approved tokens for the L1 bridge,
token approval will be skipped.

## Usage

:::code-group

```ts [example.ts]
import { account, walletClient, zksyncClient } from './config'
import { legacyEthAddress } from 'viem/zksync'

// deposit ETH
const hash = await walletClient.deposit({
  account,
  client: zksyncClient,
  token: legacyEthAddress,
  amount: 7_000_000_000n,
  to: account.address,
  refundRecipient: account.address,
})

// deposit ERC20
const txHash = await walletClient.deposit({
    account,
    client: zksyncClient,
    token: '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55',
    amount: 20n,
    to: account.address,
    approveToken: true,
    refundRecipient: account.address,
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

If you do not wish to pass an `account` to every `deposit`, you can also hoist the Account on the Wallet Client (see `config.ts`).

[Learn more](/docs/clients/wallet#account).

:::code-group

```ts [example.ts]
import { walletClient, zksyncClient } from './config'
import { legacyEthAddress } from 'viem/zksync'

// deposit ETH
const hash = await walletClient.deposit({
  client: zksyncClient,
  token: legacyEthAddress,
  amount: 7_000_000_000n,
  to: walletClient.account.address,
  refundRecipient: walletClient.account.address,
})

// deposit ERC20
const txHash = await walletClient.deposit({
  client: zksyncClient,
  token: '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55',
  amount: 20n,
  to: walletClient.account.address,
  approveToken: true,
  refundRecipient: walletClient.account.address,
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
const hash = await walletClient.deposit({
  client: zksyncClient, // [!code focus]
  token: '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55',
  amount: 20n,
  to: walletClient.account.address,
  approveToken: true,
  refundRecipient: walletClient.account.address,
})
```

### token

- **Type:** `Address`

The address of the token to deposit.

```ts
const hash = await walletClient.deposit({
  client: zksyncClient,
  token: '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55', // [!code focus]
  amount: 20n,
  to: walletClient.account.address,  
  approveToken: true,
  refundRecipient: walletClient.account.address,
})
```

### amount

- **Type:** `bigint`

The amount of the token to deposit.

```ts
const hash = await walletClient.deposit({
  client: zksyncClient,
  token: '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55',
  amount: 20n, // [!code focus]
  to: walletClient.account.address,
  approveToken: true,
  refundRecipient: walletClient.account.address,
})
```

### to (optional)

- **Type:** `Address`
- **Default:** `walletClient.account`

The address that will receive the deposited tokens on L2.

```ts
const hash = await walletClient.deposit({
  client: zksyncClient,
  token: '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55',
  amount: 20n,
  to: walletClient.account.address, // [!code focus]
  approveToken: true,
  refundRecipient: walletClient.account.address,
})
```

### operatorTip (optional)

- **Type:** `bigint`

The tip the operator will receive on top of the base cost of the transaction.
Currently, ZKsync node do not consider this tip.

```ts
const hash = await walletClient.deposit({
  client: zksyncClient,
  token: '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55',
  amount: 20n,
  to: walletClient.account.address,
  operatorTip: 100_000n, // [!code focus]
  approveToken: true,
  refundRecipient: walletClient.account.address,
})
```

### l2GasLimit (optional)

- **Type:** `bigint`

Maximum amount of L2 gas that transaction can consume during execution on L2.

```ts
const hash = await walletClient.requestExecute({
  client: zksyncClient,
  token: '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55',
  amount: 20n,
  to: walletClient.account.address,
  l2GasLimit: 900_000n, // [!code focus]
  approveToken: true,
  refundRecipient: walletClient.account.address,
})
```

### gasPerPubdataByte (optional)

- **Type:** `bigint`

The L2 gas price for each published L1 calldata byte.

```ts
const hash = await walletClient.deposit({
  client: zksyncClient,
  token: '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55',
  amount: 20n,
  to: walletClient.account.address,
  approveToken: true,
  refundRecipient: walletClient.account.address,
  gasPerPubdataByte: 250_000_000_000n // [!code focus]
})
```

### refundRecipient (optional)

- **Type:** `Address`
- **Default:** `walletClient.account`

The address on L2 that will receive the refund for the transaction.
If the transaction fails, it will also be the address to receive `amount`.

```ts
const hash = await walletClient.deposit({
  client: zksyncClient,
  token: '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55',
  amount: 20n,
  to: walletClient.account.address,
  approveToken: true,
  refundRecipient: walletClient.account.address, // [!code focus]
})
```

### bridgeAddress (optional)

- **Type:** `Address`
- **Default:** ZKsync L1 shared bridge

The address of the bridge contract to be used.

```ts
const hash = await walletClient.deposit({
  client: zksyncClient,
  token: '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55',
  amount: 20n,
  to: walletClient.account.address,
  approveToken: true,
  refundRecipient: walletClient.account.address, 
  bridgeAddress: '0xFC073319977e314F251EAE6ae6bE76B0B3BAeeCF' // [!code focus]
})
```

### customBridgeData (optional)

- **Type:** `Hex`

Additional data that can be sent to a bridge.

```ts
const hash = await walletClient.deposit({
  client: zksyncClient,
  token: '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55',
  amount: 20n,
  to: walletClient.account.address,
  approveToken: true,
  refundRecipient: walletClient.account.address,
  bridgeAddress: '0xFC073319977e314F251EAE6ae6bE76B0B3BAeeCF', 
  customBridgeData: '0x...' // [!code focus],
})
```

### approveToken (optional)

- **Type:** `boolean | TransactionRequest`

Whether token approval should be performed under the hood.
Set this flag to true (or provide transaction overrides) if the bridge does
not have sufficient allowance. The approval transaction is executed only if
the bridge lacks sufficient allowance; otherwise, it is skipped.

::: code-group

```ts [boolean.ts]
const hash = await walletClient.deposit({
  client: zksyncClient,
  token: '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55',
  amount: 20n,
  to: walletClient.account.address,
  approveToken: true, // [!code focus],
  refundRecipient: walletClient.account.address,
  bridgeAddress: '0xFC073319977e314F251EAE6ae6bE76B0B3BAeeCF',
})
```

```ts [overrides.ts]
const hash = await walletClient.deposit({
  client: zksyncClient,
  token: '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55',
  amount: 20n,
  to: walletClient.account.address,
  approveToken: { 
    maxFeePerGas: 200_000_000_000n // [!code focus],  
  },
  refundRecipient: walletClient.account.address,
  bridgeAddress: '0xFC073319977e314F251EAE6ae6bE76B0B3BAeeCF',
})
```

:::

### approveBaseToken (optional)

- **Type:** `boolean | TransactionRequest`

Whether base token approval should be performed under the hood.
Set this flag to true (or provide transaction overrides) if the bridge does
not have sufficient allowance. The approval transaction is executed only if
the bridge lacks sufficient allowance; otherwise, it is skipped.

::: code-group

```ts [boolean.ts]
const hash = await walletClient.deposit({
  client: zksyncClient,
  token: '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55',
  amount: 20n,
  to: walletClient.account.address,
  approveBaseToken: true, // [!code focus],
  refundRecipient: walletClient.account.address,
  bridgeAddress: '0xFC073319977e314F251EAE6ae6bE76B0B3BAeeCF',
})
```

```ts [overrides.ts]
const hash = await walletClient.deposit({
  client: zksyncClient,
  token: '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55',
  amount: 20n,
  to: walletClient.account.address,
  approveBaseToken: { 
    maxFeePerGas: 200_000_000_000n // [!code focus],  
  },
  refundRecipient: walletClient.account.address,
  bridgeAddress: '0xFC073319977e314F251EAE6ae6bE76B0B3BAeeCF',
})
```

:::

### chain (optional)

- **Type:** [`Chain`](/docs/glossary/types#chain)
- **Default:** `walletClient.chain`

The target chain. If there is a mismatch between the wallet's current chain & the target chain, an error will be thrown.

```ts
import { zksync } from 'viem/chains' // [!code focus]

const hash = await walletClient.deposit({
  chain: zksync, // [!code focus]
  client: zksyncClient,
  token: '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55',
  amount: 20n,
  to: walletClient.account.address,
  approveToken: true,
  refundRecipient: walletClient.account.address,
})
```