# decodeDeployData

Decodes ABI encoded deploy data (bytecode & arguments).

The opposite of [`encodeDeployData`](/docs/contract/encodeDeployData).

## Install

```ts
import { decodeDeployData } from 'viem'
```

## Usage

::: code-group

```ts [example.ts]
import { decodeFunctionData } from 'viem'

const { args } = decodeFunctionData({
  abi: wagmiAbi,
  bytecode: '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c63430008070033',
  data: '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c634300080700330000000000000000000000000000000000000000000000000000000000010f2c'
})
// { args: [69420n], bytecode: '0x6080604...' }
```

```ts
export const wagmiAbi = [
  ...
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'a',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  ...
] as const;
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


## Return Value

```ts
{
  args: unknown[] | undefined;
  bytecode: Hex;
}
```

Decoded deploy data.

## Parameters

### abi

- **Type:** [`Abi`](/docs/glossary/types#TODO)

The contract's ABI.

```ts
const { args } = decodeFunctionData({
  abi: wagmiAbi, // [!code focus]
  bytecode: '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c63430008070033',
  data: '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c634300080700330000000000000000000000000000000000000000000000000000000000010f2c'
})
```

### bytecode

- **Type:** `Hex`

Contract bytecode.

```ts
const { args } = decodeFunctionData({
  abi: wagmiAbi,
  bytecode: '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c63430008070033', // [!code focus]
  data: '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c634300080700330000000000000000000000000000000000000000000000000000000000010f2c'
})
```

### data

- **Type:** `Hex`

The encoded calldata.

```ts
const { args } = decodeFunctionData({
  abi: wagmiAbi,
  bytecode: '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c63430008070033',
  data: '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c634300080700330000000000000000000000000000000000000000000000000000000000010f2c' // [!code focus]
})
```