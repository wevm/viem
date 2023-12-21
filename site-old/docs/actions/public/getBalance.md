---
head:
  - - meta
    - property: og:title
      content: getBalance
  - - meta
    - name: description
      content: Returns the balance of an address in wei.
  - - meta
    - property: og:description
      content: Returns the balance of an address in wei.

---

# getBalance

Returns the balance of an address in wei.

## Usage

::: code-group

```ts [example.ts]
import { publicClient } from './client'

const balance = await publicClient.getBalance({ // [!code focus:4]
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
})
// 10000000000000000000000n (wei)
```

```ts [client.ts]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

## Returns

`bigint`

The balance of the address in wei.

## Parameters

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The address of the account.

```ts
const balance = await publicClient.getBalance({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `bigint`

The balance of the account at a block number.

```ts
const balance = await publicClient.getBalance({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockNumber: 69420n  // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`

The balance of the account at a block tag.

```ts
const balance = await publicClient.getBalance({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockTag: 'safe'  // [!code focus]
})
```

## Tips

- You can convert the balance to ether units with [`formatEther`](/docs/utilities/formatEther).

```ts
const balance = await publicClient.getBalance({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockTag: 'safe'
})
const balanceAsEther = formatEther(balance) // [!code focus:2]
// "6.942"
```

## JSON-RPC Method

[`eth_getBalance`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getbalance)
