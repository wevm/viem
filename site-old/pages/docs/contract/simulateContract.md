# simulateContract [Simulates & validates a contract interaction.]

The `simulateContract` function **simulates**/**validates** a contract interaction. This is useful for retrieving **return data** and **revert reasons** of contract write functions.

This function does not require gas to execute and _**does not**_ change the state of the blockchain. It is almost identical to [`readContract`](/docs/contract/readContract), but also supports contract write functions.

Internally, `simulateContract` uses a [Public Client](/docs/clients/public) to call the [`call` action](/docs/actions/public/call) with [ABI-encoded `data`](/docs/contract/encodeFunctionData).

## Usage

Below is a very basic example of how to simulate a write function on a contract (with no arguments).

The `mint` function accepts no arguments, and returns a token ID.

:::code-group

```ts [example.ts]
import { account, publicClient } from './config'
import { wagmiAbi } from './abi'

const { result } = await publicClient.simulateContract({
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
import { mainnet } from 'viem/chains'

// JSON-RPC Account
export const account = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
// Local Account
export const account = privateKeyToAccount(...)

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

### Passing Arguments

If your function requires argument(s), you can pass them through with the `args` attribute.

TypeScript types for `args` will be inferred from the function name & ABI, to guard you from inserting the wrong values.

For example, the `mint` function name below requires a **tokenId** argument, and it is typed as `[number]`.

:::code-group

```ts [example.ts]
import { account, publicClient } from './config'
import { wagmiAbi } from './abi'

const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420], // [!code focus]
  account,
})
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [{ name: "owner", type: "uint32" }],
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
import { mainnet } from 'viem/chains'

// JSON-RPC Account
export const account = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
// Local Account
export const account = privateKeyToAccount(...)

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

### Pairing with `writeContract`

The `simulateContract` function also pairs well with `writeContract`.

In the example below, we are **validating** if the contract write will be successful via `simulateContract`. If no errors are thrown, then we are all good. After that, we perform a contract write to execute the transaction.

:::code-group

```ts [example.ts]
import { account, walletClient, publicClient } from './config'
import { wagmiAbi } from './abi'

const { request } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  account,
})
const hash = await walletClient.writeContract(request)
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
import { createPublicClient, custom, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

// JSON-RPC Account
export const account = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
// Local Account
export const account = privateKeyToAccount(...)

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

### Handling Custom Errors

In the example below, we are **catching** a [custom error](https://blog.soliditylang.org/2021/04/21/custom-errors/) thrown by the `simulateContract`. It is important to include the custom error item in the contract `abi`.

You can access the custom error through the `data` attribute of the error:

:::code-group

```ts [example.ts] {13-27}
import { BaseError, ContractFunctionRevertedError } from 'viem';
import { account, walletClient, publicClient } from './config'
import { wagmiAbi } from './abi'

try {
  await publicClient.simulateContract({
    address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
    abi: wagmiAbi,
    functionName: 'mint',
    account,
  })
} catch (err) {
  if (err instanceof BaseError) {
    const revertError = err.walk(err => err instanceof ContractFunctionRevertedError)
    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName ?? ''
      // do something with `errorName`
    }
  }
}

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
  // Custom solidity error
  {
    type: 'error',
    inputs: [],
    name: 'MintIsDisabled'
  },
  ...
] as const;
```

```solidity [WagmiExample.sol]
// ...
error MintIsDisabled();
contract WagmiExample {
  // ...

    function mint() public {
      // ...
      revert MintIsDisabled();
      // ...
    }

  // ...
}
```

```ts [config.ts]
import { createPublicClient, custom, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

// JSON-RPC Account
export const account = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
// Local Account
export const account = privateKeyToAccount(...)

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

### State Overrides

When using `simulateContract`, there sometimes needs to be an initial state change to make the transaction pass. A common use case would be an approval. For that, there are [state overrides](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-eth#eth-call). In the example below, we are simulating sending a token on behalf of another user. To do this, we need to modify the state of the token contract to have maximum approve from the token owner.

:::code-group

```ts twoslash [example.ts]
// @twoslash-cache: {"v":2,"hash":"f66cdf0d4d6e9a06bcdadd6396d1d79dbdcf98a3ef6634bf4506b6719744ab07","data":"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"}
import { account, publicClient } from './config'
import { abi, address } from './contract'

// Allowance slot: A 32 bytes hex string representing the allowance slot of the sender.
const allowanceSlot = '0x....'

// Max allowance: A 32 bytes hex string representing the maximum allowance (2^256 - 1)
const maxAllowance = numberToHex(maxUint256)

const { result } = await publicClient.simulateContract({
  abi,
  address,
  account,
  functionName: 'transferFrom',
  args: [
    '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
    account.address, 
    69420n
  ],
  stateOverride: [ // [!code hl]
    { // [!code hl]
      // modifying the state of the token contract // [!code hl]
      address, // [!code hl]
      stateDiff: [ // [!code hl]
        { // [!code hl]
          slot: allowanceSlot, // [!code hl]
          value: maxAllowance, // [!code hl]
        }, // [!code hl]
      ], // [!code hl]
    }, // [!code hl]
  ], // [!code hl]
})

console.log(result)
// @log: Output: true
```

```ts twoslash [contract.ts] filename="contract.ts"
// @twoslash-cache: {"v":2,"hash":"c9634683b04f0259f191442cfdd5642f9ade79db289f9239143e63bd2b75bb2f","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAgEMopT45E7ADogADLQCCogEYAOAGwBORQEZG8gEwrZ0gMzzGKqCsUARACycNMRQFFpoxrf2j5MAELnZIyiDadSBkQVXSoAGxgwAHM0fCQAdio0AKiYIJBuXn5fMIBLMFxEUSpGfADORhpyYN0AXwp0bEKCYjJfGnomFjYuaVzBPm4WMIx2VCEwdin2Qahh0cwcQREAMwBXMErclhEAbgnpmZghsBH2ME4AWxhl6lJOVhWyADFSCEu9g+nZ+fZ/GgAsmtkn08phbpAwFhOBhONIIp9Jt9jnNTqN8lhgQIjiczuMkYcpj80ecrjdhH5IrBSIjCcjcQsmrdMnw4HBadN6uxgF86cSzhdrrc+IxclhcpE0By+SjfotySIWfxpewuTyCYT+aNBQqMpcIBspSB9hrDlr2PLbmt8mgNABWeQq2oAXRNZtlJINaExaGx5vxdKJHrOlop0ggEDCTtdExdvn8gSQsg04UiMTiiFC1BSaTwcNyOXyhRTIFK5UqbRq9UaODwhBI5CSdHSAAosG8cIEMABKC1MinrTZobZgHxUBNBRSyVPRWJIcxJHPpeWFgrzkple4V6rmavUJp11qN6jNvBtjtkTC9nW3ND3R4vN4fEDx5KJ4IaYogCKzjML7OkKk6Q6quhR2hu5ZVPOe4rogLQNu0p5weeECdlefzJICwL5mCGAQiw0KwvCMBjn4b5BCo5jyDO6ZICo4EAUBeD/DAQIgrkuGgUg1GlpuFRQYgu4NPutZwfWbRNp0yHtqhl49uwGJYgMwajAG9KogKZK3HAVJkCq5qhoqPCsuyxqxhQ3K8jiGnalpFIimKEpgEabrqXK/ZGVkbKImqVnmjeFJXAazn6SpfZLBS1rOfajpmWAcbjuRdGyCoNFzogPFvkxcGKb6XGIIkvGQZWQk1s04nHh0rYyWh8kBSIOlgNSpETkgn6FT+tGCYugG5nBIHhEWSCKBBW4CbIMEHmJR6IVJIAobVvaGRkxnKi+iUBEEGi6Kl35pul/5ZX1Im4INa7BF+ZZjZWE3CbB8ESSec0LXJ152SIDnipKLVJYgGjxFmnUHT12XgGS+UhKN/E3ZNokPZVSHzTVr3hbqSreetZGbUguiiF+QN/iDx0rmdhSUVD25JrD5UzZJ1UXl2b1CoF+qGj92OZuYJYE+ujHHQN35DcEhVXdD1S3WVh4IXTZ7I4zqNWjaMXs+++g8Tz3V88uB6k8lFPjdTUuPVVssM+hXo+n6YVqUGDIK2GEZRnFCVY++5iiID+0ZoVR3pBbWL5Vo+slYb03S099OyfLy3hpGKtBOYuNpYTWt4CTgvndtwfi6H8OzdrODsMwrAcAAvNZvw2xXJLLYOWw7HF7p2/VdwPHATykK87yhXbLFsThuTghSkKEXCCKN25JK5VbdtV03NmkszDW6TSE8ynby3o6ZrlTL5pqT5pS8gJ9TkuVZ8/uRFnkmU6FnqoG1eH2jrMhWvmphctUW2g60Y74/oz+19MpWe99AwGQ8iAWOTs/4uhNC7Vqgl4j4y9kgBivsugl0DiLPilNEB2hdCUaAzQ6BYAgIEIu3QOBb3YOXAA5OIKQcglCqHUFoHQ+hDDGDMJYawdgHBOBcG4TwshaETAmCQshHBi49HzDQsYXxQFTFDLQuuw4WC0IoFZAKtC7xtw7l3S4GirJ92wqCQeeF2C0JHjCMeMAjEamnoIZA59LL7ymNoxq1J7EP2UVvbxhJ6guMUYSbRJ9JT+LpL41abIImck0fvYJhxtFBUNLEw4yiv4xTSaqeJhxnS5OmIA7EziEkuKUf2WhUDsmBI1Pkr4NTnRcDgBQzBVBrjJCQKAZskQ4AjjTggWotQgA==="}
export const address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

export const abi = [
  {
    type: 'function',
    name: 'transferFrom',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'sender',
        type: 'address',
      },
      {
        name: 'recipient',
        type: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        type: 'bool',
      },
    ],
  },
] as const
```

```ts twoslash [config.ts] filename="config.ts"
// @twoslash-cache: {"v":2,"hash":"665fc004727466b0c417a0fa7eefb703b3c25b9fa74a5e8feb09a4d7026701a1","data":"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"}
import { createPublicClient, custom, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

export const account = privateKeyToAccount('0x...')
 
export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

## Return Value

The simulation result and write request. Type is inferred.

## Parameters

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The contract address.

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
  abi: wagmiAbi,
  functionName: 'mint',
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
})
```

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi, // [!code focus]
  functionName: 'mint',
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
})
```

### functionName

- **Type:** `string`

A function to extract from the ABI.

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint', // [!code focus]
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
})
```

### account

- **Type:** `Account | Address | null`

The Account to simulate the contract method from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc). If set to `null`, it is assumed that the transport will handle the filling the sender of the transaction.

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' // [!code focus]
})
```

### accessList (optional)

- **Type:** [`AccessList`](/docs/glossary/types#accesslist)

The access list.

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  accessList: [{ // [!code focus:4]
    address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    storageKeys: ['0x1'],
  }],
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
})
```

### authorizationList (optional)

- **Type:** `AuthorizationList`

Signed EIP-7702 Authorization list.

```ts
const authorization = await walletClient.signAuthorization({ 
  contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', 
}) 

const { result } = await publicClient.simulateContract({
  address: account.address,
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  authorizationList: [authorization], // [!code focus]
})
```

:::note
**References**
- [EIP-7702 Overview](/docs/eip7702)
- [`signAuthorization` Docs](/docs/eip7702/signAuthorization)
:::

### args (optional)

- **Type:** Inferred from ABI.

Arguments to pass to function call.

```ts
const { result } = await publicClient.simulateContract({
  address: '0x1dfe7ca09e99d10835bf73044a23b73fc20623df',
  abi: wagmiAbi,
  functionName: 'balanceOf',
  args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'], // [!code focus]
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
})
```

### blockNumber (optional)

- **Type:** `number`

The block number to perform the read against.

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  blockNumber: 15121123n, // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to perform the read against.

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  blockTag: 'safe', // [!code focus]
})
```

### dataSuffix (optional)

- **Type:** `Hex`

Data to append to the end of the calldata. Useful for adding a ["domain" tag](https://opensea.notion.site/opensea/Seaport-Order-Attributions-ec2d69bf455041a5baa490941aad307f).

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  dataSuffix: '0xdeadbeef' // [!code focus]
})
```

### gas (optional)

- **Type:** `bigint`

The gas limit for the transaction.

```ts
await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  gas: 69420n, // [!code focus]
})
```

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas. Only applies to [Legacy Transactions](/docs/glossary/terms#legacy-transaction).

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  gasPrice: parseGwei('20'), // [!code focus]
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  maxFeePerGas: parseGwei('20'),  // [!code focus]
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'), // [!code focus]
})
```

### nonce (optional)

- **Type:** `number`

Unique number identifying this transaction.

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  nonce: 69 // [!code focus]
})
```

### stateOverride (optional)

- **Type:** [`StateOverride`](/docs/glossary/types#stateoverride)

The state override set is an optional address-to-state mapping, where each entry specifies some state to be ephemerally overridden prior to executing the call.

> Note: By using state overrides, you simulate the contract based on a fake state. Using this is useful for testing purposes, but making a transaction based on the returned `request` object might fail regardless of the simulation result.

```ts
const data = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  stateOverride: [ // [!code focus]
    { // [!code focus]
      address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', // [!code focus]
      balance: parseEther('1'), // [!code focus]
      stateDiff: [ // [!code focus]
        { // [!code focus]
          slot: '0x3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0', // [!code focus]
          value: '0x00000000000000000000000000000000000000000000000000000000000001a4', // [!code focus]
        }, // [!code focus]
      ], // [!code focus]
    } // [!code focus]
  ], // [!code focus]
})
```

### value (optional)

- **Type:** `number`

Value in wei sent with this transaction.

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  value: parseEther('1') // [!code focus]
})
```

## Live Example

Check out the usage of `simulateContract` in the live [Writing to Contracts Example](https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts_writing-to-contracts) below.

<iframe frameBorder="0" width="100%" height="500px" src="https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts_writing-to-contracts?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>
