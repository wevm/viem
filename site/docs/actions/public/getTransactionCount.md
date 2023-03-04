---
head:
  - - meta
    - property: og:title
      content: getTransactionCount
  - - meta
    - name: description
      content: Returns the number of Transactions an Account has broadcast / sent.
  - - meta
    - property: og:description
      content: Returns the number of Transactions an Account has broadcast / sent.

---

# getTransactionCount

Returns the number of [Transactions](/docs/glossary/terms#transaction) an Account has broadcast / sent.

## Usage

```ts
import { publicClient } from '.'
 
const block = await publicClient.getTransactionCount({  // [!code focus:99]
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
})
// 420
```

## Returns

`number`

The number of transactions an account has sent. 

## Parameters

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The address of the account.

```ts
const balance = await publicClient.getTransactionCount({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', // [!code focus]
})
```

### blockNumber

- **Type:** `bigint`

Get the count at a block number.

```ts
const balance = await publicClient.getTransactionCount({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockNumber: 69420n  // [!code focus]
})
```

### blockTag

- **Type:** `bigint`

Get the count at a block tag.

```ts
const balance = await publicClient.getTransactionCount({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockTag: 'safe'  // [!code focus]
})
```

## Notes

- The transaction count of an account can also be used as a nonce.

## Example

<iframe frameborder="0" width="100%" height="500px" src="https://replit.com/@jxom/getBlockNumber?embed=true"></iframe>

## JSON-RPC Method

[`eth_getTransactionCount`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactioncount)