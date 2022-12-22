# getBalance

Returns the balance of an address in wei.

## Import

```ts
import { getBalance } from 'viem'
```

## Usage

```ts
import { getBalance } from 'viem'
import { publicClient } from '.'
 
const balance = await getBalance(publicClient, { // [!code focus:4]
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
})
// 10000000000000000000000n (wei)
```

## Returns

`bigint`

The balance of the address in wei.

## Configuration

### address

- **Type:** `'0x${string}'`

The address of the account.

```ts
const balance = await getBalance(publicClient, {
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `bigint`

The balance of the account at a block number.

```ts
const balance = await getBalance(publicClient, {
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockNumber: 69420n  // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`

The balance of the account at a block tag.

```ts
const balance = await getBalance(publicClient, {
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockTag: 'safe'  // [!code focus]
})
```

## Tips

- You can convert the balance to ether units with [`valueAsEther`](/TODO).

```ts
const balance = await getBalance(publicClient, {
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockTag: 'safe'
})
const balanceAsEther = valueAsEther(balance) // [!code focus:2]
// "6.942"
```

## Example

TODO