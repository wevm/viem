---
description: Initiates the withdrawal process which withdraws ETH or any ERC20 token from the associated account on L2 network to the target account on L1 network.
---

# withdraw

Initiates the withdrawal process which withdraws ETH or any ERC20 token
from the associated account on L2 network to the target account on L1 network.

## Usage

:::code-group

```ts [example.ts]
import { account, walletClient } from './config'
import { legacyEthAddress } from 'viem/zksync'

const hash = await walletClient.withdraw({
  account,
  amount: 1_000_000_000_000_000_000n,
  token: legacyEthAddress,
})
```

```ts [config.ts]
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { zksync } from 'viem/chains'
import { eip712Actions } from 'viem/zksync'

export const walletClient = createWalletClient({
  chain: zksync,
  transport: custom(window.ethereum)
}).extend(publicActionsL2())

// JSON-RPC Account
export const [account] = await walletClient.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::

### Account Hoisting

If you do not wish to pass an `account` to every `withdraw`, you can also hoist the Account on the Wallet Client (see `config.ts`).

[Learn more](/docs/clients/wallet#account).

:::code-group

```ts [example.ts]
import { walletClient } from './config'
import { legacyEthAddress } from 'viem/zksync'
 
const hash = await walletClient.withdraw({ // [!code focus:99]
  amount: 1_000_000_000_000_000_000n,
  token: legacyEthAddress,  
})
// '0x...'
```

```ts [config.ts (JSON-RPC Account)]
import { createWalletClient, custom } from 'viem'
import { publicActionsL2 } from 'viem/zksync'

// Retrieve Account from an EIP-712 Provider. // [!code focus]
const [account] = await window.ethereum.request({  // [!code focus]
  method: 'eth_requestAccounts' // [!code focus]
}) // [!code focus]

export const walletClient = createWalletClient({
  account,
  transport: custom(window.ethereum) // [!code focus]
}).extend(publicActionsL2())
```

```ts [config.ts (Local Account)]
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { publicActionsL2 } from 'viem/zksync'

export const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'), // [!code focus]
  transport: custom(window.ethereum)
}).extend(publicActionsL2())
```

:::

## Returns

[`Hash`](/docs/glossary/types#hash)

The [Transaction](/docs/glossary/terms#transaction) hash.

## Parameters

### account

- **Type:** `Account | Address`

The Account to send the transaction from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const hash = await walletClient.withdraw({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  amount: 1_000_000_000_000_000_000n,
  token: legacyEthAddress,
})
```

### amount

- **Type:** `bigint`

The amount of the token to withdraw.

```ts
const hash = await walletClient.withdraw({
  account,
  amount: 1_000_000_000_000_000_000n, // [!code focus]
  token: legacyEthAddress,
})
```

### token

- **Type:** `Address`

The address of the token on L2.

```ts
const hash = await walletClient.withdraw({
  account,
  amount: 1_000_000_000_000_000_000n,
  token: legacyEthAddress, // [!code focus]
})
```

### bridgeAddress (optional)

- **Type:** `Address`

The address of the bridge contract to be used. By default, uses shared bridge.

```ts
const address = await walletClient.withdraw({
  account,
  amount: 1_000_000_000_000_000_000n,
  token: legacyEthAddress,
  bridgeAddress: '0xf8c919286126ccf2e8abc362a15158a461429c82' // [!code focus]
})
```

### chain (optional)

- **Type:** [`Chain`](/docs/glossary/types#chain)
- **Default:** `walletClient.chain`

The target chain. If there is a mismatch between the wallet's current chain & the target chain, an error will be thrown.

The chain is also used to infer its request type.

```ts
import { zksync } from 'viem/chains' // [!code focus]

const hash = await walletClient.withdraw({
  chain: zksync, // [!code focus]
  account,
  amount: 1_000_000_000_000_000_000n,
  token: legacyEthAddress,
})
```

### gasPerPubdata (optional)

- **Type:** `bigint`

The amount of gas for publishing one byte of data on Ethereum.

```ts
const hash = await walletClient.withdraw({
  account,
  amount: 1_000_000_000_000_000_000n,
  token: legacyEthAddress,
  gasPerPubdata: 50000, // [!code focus]
})
```

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas. Only applies to [Legacy Transactions](/docs/glossary/terms#legacy-transaction).

```ts
const hash = await walletClient.withdraw({
  account,
  amount: 1_000_000_000_000_000_000n,
  token: legacyEthAddress,
  gasPrice: parseGwei('20'), // [!code focus]
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts
const hash = await walletClient.withdraw({
  account,
  amount: 1_000_000_000_000_000_000n,
  token: legacyEthAddress,
  maxFeePerGas: parseGwei('20'),  // [!code focus]
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts
const hash = await walletClient.withdraw({
  account, 
  amount: 1_000_000_000_000_000_000n,
  token: legacyEthAddress,
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'), // [!code focus]
})
```

### nonce (optional)

- **Type:** `number`

Unique number identifying this transaction.

```ts
const hash = await walletClient.withdraw({
  account,
  amount: 1_000_000_000_000_000_000n,
  token: legacyEthAddress,
  nonce: 69 // [!code focus]
})
```


### paymaster (optional)

- **Type:** `Account | Address`

Address of the paymaster account that will pay the fees. The `paymasterInput` field is required with this one.

```ts
const hash = await walletClient.withdraw({
  account,
  amount: 1_000_000_000_000_000_000n,
  token: legacyEthAddress,
  paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021', // [!code focus]
  paymasterInput: '0x8c5a...' // [!code focus]
})
```

### paymasterInput (optional)

- **Type:** `0x${string}`

Input data to the paymaster. The `paymaster` field is required with this one.

```ts
const hash = await walletClient.withdraw({
  account,
  amount: 1_000_000_000_000_000_000n,
  token: legacyEthAddress,
  paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021', // [!code focus]
  paymasterInput: '0x8c5a...' // [!code focus]
})
```

### to (optional)

- **Type:** `Address`

The address of the recipient on L1. Defaults to the sender address.

```ts
const hash = await walletClient.withdraw({
  account,
  amount: 1_000_000_000_000_000_000n,
  token: legacyEthAddress,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
})
```