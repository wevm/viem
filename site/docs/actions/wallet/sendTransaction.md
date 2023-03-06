---
head:
  - - meta
    - property: og:title
      content: sendTransaction
  - - meta
    - name: description
      content: Creates, signs, and sends a new transaction to the network.
  - - meta
    - property: og:description
      content: Creates, signs, and sends a new transaction to the network.

---

# sendTransaction

Creates, signs, and sends a new transaction to the network.

## Usage

```ts
import { getAccount } from 'viem'
import { walletClient } from '.'

const account = getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')
 
const hash = await walletClient.sendTransaction({ // [!code focus:99]
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
// '0x...'
```

## Returns

[`Hash`](/docs/glossary/types#hash)

The [Transaction](/docs/glossary/terms#transaction) hash.

## Parameters

### account

- **Type:** `Account`

The Account sender. [Read more](/docs/clients/wallet).

```ts
const hash = await walletClient.sendTransaction({
  account: getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
```

### to

- **Type:** `number`

The transaction recipient or contract address.

```ts
const hash = await walletClient.sendTransaction({
  account, // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n,
  nonce: 69
})
```

### accessList (optional)

- **Type:** [`AccessList`](/docs/glossary/types#accesslist)

The access list.

```ts
const data = await publicClient.sendTransaction({
  accessList: [ // [!code focus:6]
    {
      address: '0x1',
      storageKeys: ['0x1'],
    },
  ],
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### assertChain (optional)

- **Type:** `boolean`
- **Default:** `true`

Throws an error if `chain` does not match the current wallet chain.

Defaults to `true`, but you can turn this off if your dapp is primarily multi-chain.

```ts
import { optimism } from 'viem/chains' // [!code focus]

const hash = await walletClient.sendTransaction({
  assertChain: false, // [!code focus]
  chain: optimism, // [!code focus]
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
```

### chain (optional)

- **Type:** [`Chain`](/docs/glossary/types#chain)

The target chain. If there is a mismatch between the wallet's current chain & the target chain, an error will be thrown if `assertChain` is truthy.

The chain is also used to infer its request type (e.g. the Celo chain has a `gatewayFee` that you can pass through to `sendTransaction`).

```ts
import { optimism } from 'viem/chains' // [!code focus]

const hash = await walletClient.sendTransaction({
  chain: optimism, // [!code focus]
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
```

### data (optional)

- **Type:** `0x${string}`

A contract hashed method call with encoded args.

```ts
const hash = await walletClient.sendTransaction({
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // [!code focus]
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
```

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas. Only applies to [Legacy Transactions](/docs/glossary/terms#legacy-transaction).

```ts
const hash = await walletClient.sendTransaction({
  account,
  gasPrice: parseGwei('20'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1') 
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts
const hash = await walletClient.sendTransaction({
  account,
  maxFeePerGas: parseGwei('20'),  // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts
const hash = await walletClient.sendTransaction({
  account,
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### nonce (optional)

- **Type:** `number`

Unique number identifying this transaction.

```ts
const hash = await walletClient.sendTransaction({
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n,
  nonce: 69 // [!code focus]
})
```

### value (optional)

- **Type:** `number`

Value in wei sent with this transaction.

```ts
const hash = await walletClient.sendTransaction({
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1'), // [!code focus]
  nonce: 69
})
```

## Tips

- For dapps: When using this action, it is assumed that the user has connected to their wallet (e.g. given permission for the dapp to access their accounts via [`requestAddresses`](/docs/actions/wallet/requestAddresses)). You can also check if the user has granted access to their accounts via [`getAddresses`](/docs/actions/wallet/getAddresses)

## Live Example

Check out the usage of `sendTransaction` in the live [Sending Transactions Example](https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/transactions/sending-transactions) below.

<iframe frameborder="0" width="100%" height="500px" src="https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/transactions/sending-transactions?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>

## JSON-RPC Methods

- JSON-RPC Accounts:
  - [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
- Local Accounts:
  - [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction)