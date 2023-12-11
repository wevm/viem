---
head:
  - - meta
    - property: og:title
      content: getWithdrawalMessages
  - - meta
    - name: description
      content: Gets the messages from a withdrawal initialization.
  - - meta
    - property: og:description
      content: Gets the messages from a withdrawal initialization.

---

# getWithdrawalMessages

Gets messages emitted from the [`MessagePassed` log](https://github.com/ethereum-optimism/optimism/blob/9f73402cb4341f7cfa83bf79769c8dddd9b014c0/packages/contracts-bedrock/src/L2/L2ToL1MessagePasser.sol#L29-L45) from a withdrawal initialization.

## Import

```ts
import { getWithdrawalMessages } from 'viem'
```

## Usage

```ts
import { extractTransactionDepositedLogs, getWithdrawalMessages } from 'viem'

const receipt = await client.getTransactionReceipt({
  hash: '0xa08acae48f12243bccd7153c88d892673d5578cce4ee9988c0332e8bba47436b',
})

const messages = getWithdrawalMessages(receipt) // [!code hl]
```

## Returns

`Hex`

The L2 transaction hash.

## Parameters

### logs

- **Type:** `Log[]`

An array of L2 logs.

```ts
const messages = getWithdrawalMessages({ 
  logs: receipt.logs // [!code focus]
})
```
