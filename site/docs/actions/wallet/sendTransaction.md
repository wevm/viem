# sendTransaction

Creates, signs, and sends a new transaction to the network.

## Usage

```ts
import { sendTransaction } from 'viem'
```

## Usage

```ts
import { sendTransaction } from 'viem'
import { walletClient } from '.'
 
const { hash } = await sendTransaction(walletClient, { // [!code focus:99]
  request: {
    from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: 1000000000000000000n
  }
})
// { hash: '0x...' }
```

## Returns

`'0x${string}'[]`

The transaction hash.

## Configuration

### request

- **Type:** [`TransactionRequest`](/TODO)

The transaction request.

```ts
const { hash } = await sendTransaction(walletClient, { 
  request: { // [!code focus:5]
    from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: 1000000000000000000n
  }
})
```

## Tips

- For dapps: When using this action, it is assumed that the user has given permission for the dapp to access their accounts via [`requestAccounts`](/TODO). You can also check if the user has granted access to accounts via [`getAccounts`](/TODO)

## Example

<iframe frameborder="0" width="100%" height="500px" src="https://replit.com/@jxom/TODO"></iframe>

