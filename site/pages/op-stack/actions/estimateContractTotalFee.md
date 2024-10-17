---
description: Estimates the total (L1 + L2) fee to execute an L2 contract write.
---

# estimateContractTotalFee

Estimates the total ([L1 data](https://docs.optimism.io/stack/transactions/fees#l1-data-fee) + L2) fee to execute an L2 contract write.

Invokes the `getL1Fee` method on the [Gas Price Oracle](https://github.com/ethereum-optimism/optimism/blob/233ede59d16cb01bdd8e7ff662a153a4c3178bdd/packages/contracts/contracts/L2/predeploys/OVM_GasPriceOracle.sol) predeploy contract.

## Usage

:::code-group

```ts [example.ts]
import { account, publicClient } from './config'
import { wagmiAbi } from './abi'

const fee = await publicClient.estimateContractTotalFee({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  account,
})
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [],
    name: "mint",
    outputs: [{ name: "", type: "uint32" }],
    stateMutability: "view",
    type: "function",
  },
  ...
] as const;
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import { publicActionsL2 } from 'viem/op-stack'

// JSON-RPC Account
export const account = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
// Local Account
export const account = privateKeyToAccount(...)

export const publicClient = createPublicClient({
  chain: base,
  transport: http()
}).extend(publicActionsL2())
```

:::

## Returns

`bigint`

The total (L1 + L2) fee estimate (in wei).

## Parameters

### account

- **Type:** `Account | Address`

The Account to estimate fee from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const fee = await publicClient.estimateContractTotalFee({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
})
```

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

```ts
const fee = await publicClient.estimateContractTotalFee({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi, // [!code focus]
  functionName: 'mint',
})
```

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The contract address.

```ts
const fee = await publicClient.estimateContractTotalFee({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
  abi: wagmiAbi,
  functionName: 'mint',
})
```

### functionName

- **Type:** `string`

A function to extract from the ABI.

```ts
const fee = await publicClient.estimateContractTotalFee({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint', // [!code focus]
})
```

### args (optional)

- **Type:** Inferred from ABI.

Arguments to pass to function call.

```ts
const fee = await publicClient.estimateContractTotalFee({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  address: '0x1dfe7ca09e99d10835bf73044a23b73fc20623df',
  abi: wagmiAbi,
  functionName: 'balanceOf',
  args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'], // [!code focus]
})
```

### gasPriceOracleAddress (optional)

- **Type:** [`Address`](/docs/glossary/types#address)

Address of the Gas Price Oracle predeploy contract.

```ts
const fee = await publicClient.estimateContractTotalFee({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  gasPriceOracleAddress: '0x420000000000000000000000000000000000000F', // [!code focus]
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. 

```ts
const fee = await publicClient.estimateContractTotalFee({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  maxFeePerGas: parseGwei('20'),  // [!code focus]
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). 

```ts
const fee = await publicClient.estimateContractTotalFee({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  maxPriorityFeePerGas: parseGwei('2'), // [!code focus]
})
```

### nonce (optional)

- **Type:** `number`

Unique number identifying this transaction.

```ts
const fee = await publicClient.estimateContractTotalFee({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  nonce: 69, // [!code focus]
})
```

### value (optional)

- **Type:** `bigint`

Value (in wei) sent with this transaction.

```ts
const fee = await publicClient.estimateContractTotalFee({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  value: parseEther('1') // [!code focus]
})
```
