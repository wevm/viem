# Contract Writes with EIP-7702

The guide below demonstrates how to perform Contract Writes with EIP-7702 to invoke Contract functions on an Externally Owned Account (EOA).

## Overview

Here is an end-to-end overview of how to perform a Contract Write to send a batch of Calls. We will break it down into [Steps](#steps) below.

:::code-group

```ts twoslash [example.ts]
import { privateKeyToAccount } from 'viem/accounts'
import { walletClient } from './config'
import { abi, contractAddress } from './contract'

const eoa = privateKeyToAccount('0x...')

// 1. Authorize designation of the Contract onto the EOA.
const authorization = await walletClient.signAuthorization({
  account: eoa,
  contractAddress,
})

// 2. Designate the Contract on the EOA, and invoke the 
//    `initialize` function.
const hash = await walletClient.writeContract({
  abi,
  address: eoa.address,
  authorizationList: [authorization],
  //                  ↑ 3. Pass the Authorization as a parameter.
  functionName: 'initialize',
})
```

```ts twoslash [config.ts] filename="config.ts"
import { createWalletClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts' 

export const relay = privateKeyToAccount('0x...')
 
export const walletClient = createWalletClient({
  account: relay,
  chain: sepolia,
  transport: http(),
})
```

```ts twoslash [contract.ts] filename="contract.ts"
export const abi = [
  {
    "type": "function",
    "name": "initialize",
    "inputs": [],
    "outputs": [],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "ping",
    "inputs": [],
    "outputs": [],
    "stateMutability": "pure"
  },
] as const

export const contractAddress = '0x...'
```

```solidity [Delegation.sol]
pragma solidity ^0.8.20;

contract Delegation {
  event Log(string message);

  function initialize() external payable {
    emit Log('Hello, world!');
  }

  function ping() external pure {
    emit Log('Pong!');
  }
}
```

:::

## Steps

### 1. Set up Smart Contract

We will need to set up a Smart Contract to designate on the Account. For the purposes of this guide, we will [create](https://book.getfoundry.sh/reference/forge/forge-init) and [deploy](https://book.getfoundry.sh/forge/deploying) a simple demonstration `Delegation.sol` contract, however, you can use any existing deployed contract.

Firstly, [deploy a Contract](https://book.getfoundry.sh/forge/deploying) to the Network with the following source:

```solidity [Delegation.sol]
pragma solidity ^0.8.20;

contract Delegation {
  event Log(string message);

  function initialize() external payable {
    emit Log('Hello, world!');
  }

  function ping() external pure {
    emit Log('Pong!');
  }
}
```

### 2. Set up Client & Account

Next, we will need to set up a Client and a "Relay Account" that will be responsible for executing the EIP-7702 Contract Write.

```ts twoslash [config.ts]
import { createWalletClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

export const relay = privateKeyToAccount('0x...')
 
export const walletClient = createWalletClient({
  account: relay,
  chain: sepolia,
  transport: http(),
})
```

:::info

In this demo, we will be using a "Relay Account" (not the EOA) to execute the Transaction. This is typically how EIP-7702 is used in practice, as the relayer can sponsor the gas fees to perform the Transaction.

However, it is also possible for the EOA to sign and also execute the Transaction. [See more](#note-self-executing-eip-7702).
:::

### 3. Authorize Contract Designation

We will need to sign an Authorization to designate the Contract to the Account.

In the example below, we are instantiating an existing EOA (`account`) and using it to sign the Authorization – this will be the Account that will be used for delegation.

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './config'
import { contractAddress } from './contract'

const eoa = privateKeyToAccount('0x...') // [!code focus]
 
const authorization = await walletClient.signAuthorization({ // [!code focus]
  account: eoa, // [!code focus]
  contractAddress, // [!code focus]
}) // [!code focus]
```

```ts twoslash [contract.ts] filename="contract.ts"
export const abi = [
  {
    "type": "function",
    "name": "initialize",
    "inputs": [],
    "outputs": [],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "ping",
    "inputs": [],
    "outputs": [],
    "stateMutability": "pure"
  },
] as const

export const contractAddress = '0x...'
```

```ts twoslash [config.ts]
import { createWalletClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

export const relay = privateKeyToAccount('0x...')
 
export const walletClient = createWalletClient({
  account: relay,
  chain: sepolia,
  transport: http(),
})
```

:::

:::info
If the EOA is also executing the Transaction, you will need to pass `executor: 'self'` to `signAuthorization`. [See more](#note-self-executing-eip-7702).
:::

### 4. Execute Contract Write

We can now designate the Contract on the Account (and execute the `initialize` function) by sending an EIP-7702 Contract Write.

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './config'
import { abi, contractAddress } from './contract'

const eoa = privateKeyToAccount('0x...')
 
const authorization = await walletClient.signAuthorization({
  account: eoa,
  contractAddress,
})

const hash = await walletClient.writeContract({ // [!code focus]
  abi, // [!code focus]
  address: eoa.address, // [!code focus]
  authorizationList: [authorization], // [!code focus]
  functionName: 'initialize', // [!code focus]
}) // [!code focus]
```

```ts twoslash [contract.ts] filename="contract.ts"
export const abi = [
  {
    "type": "function",
    "name": "initialize",
    "inputs": [],
    "outputs": [],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "ping",
    "inputs": [],
    "outputs": [],
    "stateMutability": "pure"
  },
] as const

export const contractAddress = '0x...'
```

```ts twoslash [config.ts]
import { createWalletClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

export const relay = privateKeyToAccount('0x...')
 
export const walletClient = createWalletClient({
  account: relay,
  chain: sepolia,
  transport: http(),
})
```

:::

### 5. (Optional) Interact with the Delegated Account

Now that we have designated a Contract onto the Account, we can interact with it by invoking its functions. 

Note that we no longer need to use an Authorization!

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './config'
import { abi } from './contract'

const eoa = privateKeyToAccount('0x...')

const hash = await walletClient.writeContract({
  abi,
  address: eoa.address,
  functionName: 'ping', // [!code hl]
})
```

```ts twoslash [contract.ts] filename="contract.ts"
export const abi = [
  {
    "type": "function",
    "name": "initialize",
    "inputs": [],
    "outputs": [],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "ping",
    "inputs": [],
    "outputs": [],
    "stateMutability": "pure"
  },
] as const

export const contractAddress = '0x...'
```

```ts twoslash [config.ts]
import { createWalletClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

export const relay = privateKeyToAccount('0x...')
 
export const walletClient = createWalletClient({
  account: relay,
  chain: sepolia,
  transport: http(),
})
```

:::


### Note: Self-executing EIP-7702

If the signer of the Authorization (ie. the EOA) is also executing the Transaction, you will need to pass `executor: 'self'` to `signAuthorization`. 

This is because `authorization.nonce` must be incremented by 1 over `transaction.nonce`, so we will need to hint to `signAuthorization` that this is the case.

:::tip
In the example below, we are attaching an EOA to the Wallet Client (see `config.ts`), and using it for signing the Authorization and executing the Transaction.
:::

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './config'
import { abi, contractAddress } from './contract'

const authorization = await walletClient.signAuthorization({
  account: eoa, // [!code --]
  contractAddress,
  executor: 'self', // [!code ++]
})

const hash = await walletClient.writeContract({
  abi,
  address: eoa.address, // [!code --]
  address: walletClient.account.address, // [!code ++]
  authorizationList: [authorization],
  functionName: 'initialize',
})
```

```ts twoslash [config.ts]
// @noErrors
import { createWalletClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

export const relay = privateKeyToAccount('0x...') // [!code --]
export const eoa = privateKeyToAccount('0x...') // [!code ++]
 
export const walletClient = createWalletClient({
  account: relay, // [!code --]
  account: eoa, // [!code ++]
  chain: sepolia,
  transport: http(),
})
```

```ts twoslash [contract.ts] filename="contract.ts"
export const abi = [
  {
    "type": "function",
    "name": "initialize",
    "inputs": [],
    "outputs": [],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "ping",
    "inputs": [],
    "outputs": [],
    "stateMutability": "pure"
  },
] as const

export const contractAddress = '0x...'
```

:::
