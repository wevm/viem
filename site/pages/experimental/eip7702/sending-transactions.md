# Sending Transactions with EIP-7702

The guide below demonstrates how to send EIP-7702 Transactions to invoke Contract functions on an Externally Owned Account.

## Overview

Here is an end-to-end overview of how to broadcast an EIP-7702 Transaction to emit a simple event on the EOA's designated contract. We will break it down into [Steps](#steps) below.

:::code-group

```ts twoslash [example.ts]
import { parseEther } from 'viem'
import { walletClient } from './config'
import { abi, contractAddress } from './contract'

// 1. Authorize injection of the Contract's bytecode into our Account.
const authorization = await walletClient.signAuthorization({
  contractAddress,
})

// 2. Invoke the Contract's `execute` function to perform batch calls.
const hash = await walletClient.sendTransaction({
  authorizationList: [authorization],
  data: encodeFunctionData({
    abi,
    functionName: 'execute',
    args: [
      [
        {
          data: '0x',
          to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
          value: parseEther('0.001'),
        },
        {
          data: '0x',
          to: '0xd2135CfB216b74109775236E36d4b433F1DF507B', 
          value: parseEther('0.002'), 
        },  
      ],
    ]
  }),
  to: walletClient.account.address,
})
```

```ts twoslash [contract.ts] filename="contract.ts"
export const abi = [
  {
    "type": "function",
    "name": "execute",
    "inputs": [
      {
        "name": "calls",
        "type": "tuple[]",
        "components": [
          {
            "name": "data",
            "type": "bytes",
          },
          {
            "name": "to",
            "type": "address",
          },
          {
            "name": "value",
            "type": "uint256",
          }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
] as const

export const contractAddress = '0x...'
```

```ts twoslash [config.ts] filename="config.ts"
import { createWalletClient, http } from 'viem'
import { anvil } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts' 
import { eip7702Actions } from 'viem/experimental'

export const account = privateKeyToAccount('0x...')
 
export const walletClient = createWalletClient({
  account,
  chain: anvil,
  transport: http(),
}).extend(eip7702Actions())
```

```solidity [BatchCallDelegation.sol]
pragma solidity ^0.8.20;

contract BatchCallDelegation {
  struct Call {
    bytes data;
    address to;
    uint256 value;
  }

  function execute(Call[] calldata calls) external payable {
    for (uint256 i = 0; i < calls.length; i++) {
      Call memory call = calls[i];
      (bool success, ) = call.to.call{value: call.value}(call.data);
      require(success, "call reverted");
    }
  }
}
```

:::

:::warning
EIP-7702 is currently not supported on Ethereum anvil or Testnets. For this example, we are using the `anvil` chain which interfaces with an [Anvil node](https://book.getfoundry.sh/anvil/) (a local Ethereum network).
:::

## Steps

### 0. Install & Run Anvil

EIP-7702 is currently not supported on Ethereum Mainnet or Testnets, so let's set up an EIP-7702 compatible network. We will use an [Anvil node](https://book.getfoundry.sh/anvil/) for this example. If you are using an existing EIP-7702 compatible network, you can skip this step.

```bash
curl -L https://foundry.paradigm.xyz | bash
anvil --hardfork prague
```

### 1. Set up Smart Contract

We will need to set up a Smart Contract to interact with. For the purposes of this guide, we will [create](https://book.getfoundry.sh/reference/forge/forge-init) and [deploy](https://book.getfoundry.sh/forge/deploying) a `BatchCallDelegation.sol` contract, however, you can use any existing deployed contract.

Firstly, [deploy a Contract](https://book.getfoundry.sh/forge/deploying) to the Network with the following source:

```solidity [BatchCallDelegation.sol]
pragma solidity ^0.8.20;

contract BatchCallDelegation {
  struct Call {
    bytes data;
    address to;
    uint256 value;
  }

  function execute(Call[] calldata calls) external payable {
    for (uint256 i = 0; i < calls.length; i++) {
      Call memory call = calls[i];
      (bool success, ) = call.to.call{value: call.value}(call.data);
      require(success, "call reverted");
    }
  }
}
```

:::warning

**DO NOT USE IN PRODUCTION**

This contract is for demonstration purposes only to show how EIP-7702 works. If a [delegate is executing calls](#5-optional-use-a-delegate) on behalf of the Account, it does not implement a nonce & signature verification mechanism to prevent replay attacks.

:::

### 2. Set up Client & Account

Next, we will need to set up a Client and Externally Owned Account to sign EIP-7702 Authorizations.

This code snippet uses the [Extending Client](/experimental/eip7702/client) guide.

```ts twoslash [config.ts]
import { createWalletClient, http } from 'viem'
import { anvil } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { eip7702Actions } from 'viem/experimental'

export const account = privateKeyToAccount('0x...')
 
export const walletClient = createWalletClient({
  account,
  chain: anvil,
  transport: http(),
}).extend(eip7702Actions())
```

### 3. Authorize Contract Designation

We will need to sign an Authorization to designate the Contract to the Account.

In the example below, we are using the `account` attached to the `walletClient` to sign the Authorization – this will be the Account that the Contract's bytecode will be injected into.

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './config'
import { contractAddress } from './contract'
 
const authorization = await walletClient.signAuthorization({ // [!code focus]
  contractAddress, // [!code focus]
}) // [!code focus]
```

```ts twoslash [contract.ts] filename="contract.ts"
export const abi = [
  {
    "type": "function",
    "name": "execute",
    "inputs": [
      {
        "name": "calls",
        "type": "tuple[]",
        "components": [
          {
            "name": "data",
            "type": "bytes",
          },
          {
            "name": "to",
            "type": "address",
          },
          {
            "name": "value",
            "type": "uint256",
          }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
] as const

export const contractAddress = '0x...'
```

```ts twoslash [config.ts]
import { createWalletClient, http } from 'viem'
import { anvil } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { eip7702Actions } from 'viem/experimental'

export const account = privateKeyToAccount('0x...')
 
export const walletClient = createWalletClient({
  account,
  chain: anvil,
  transport: http(),
}).extend(eip7702Actions())
```

:::

### 4. Invoke Contract Function

We can now perform batch calls by sending a Transaction to the Account (`account`) with the Authorization (`authorizationList`).

:::code-group

```ts twoslash [example.ts]
import { encodeFunctionData, parseEther } from 'viem'
import { walletClient } from './config'
import { contractAddress } from './contract'
 
const authorization = await walletClient.signAuthorization({
  contractAddress,
})

const hash = await walletClient.sendTransaction({ // [!code focus]
  authorizationList: [authorization], // [!code focus]
  data: encodeFunctionData({ // [!code focus]
    abi, // [!code focus]
    functionName: 'execute', // [!code focus]
    args: [ // [!code focus]
      [ // [!code focus]
        { // [!code focus]
          data: '0x', // [!code focus]
          to: '0xcb98643b8786950F0461f3B0edf99D88F274574D', // [!code focus]
          value: parseEther('0.001'), // [!code focus]
        }, // [!code focus]
        { // [!code focus]
          data: '0x', // [!code focus]
          to: '0xd2135CfB216b74109775236E36d4b433F1DF507B', // [!code focus]
          value: parseEther('0.002'), // [!code focus]
        }, // [!code focus]
      ], // [!code focus]
    ] // [!code focus]
  }), // [!code focus]
  to: walletClient.account.address, // [!code focus]
}) // [!code focus]
```

```ts twoslash [contract.ts] filename="contract.ts"
export const abi = [
  {
    "type": "function",
    "name": "execute",
    "inputs": [
      {
        "name": "calls",
        "type": "tuple[]",
        "components": [
          {
            "name": "data",
            "type": "bytes",
          },
          {
            "name": "to",
            "type": "address",
          },
          {
            "name": "value",
            "type": "uint256",
          }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
] as const

export const contractAddress = '0x...'
```

```ts twoslash [config.ts]
import { createWalletClient, http } from 'viem'
import { anvil } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { eip7702Actions } from 'viem/experimental'

export const account = privateKeyToAccount('0x...')
 
export const walletClient = createWalletClient({
  account,
  chain: anvil,
  transport: http(),
}).extend(eip7702Actions())
```

:::

### 5. Optional: Use a Delegate

We can also utilize an Delegate Account to execute a call on behalf of the authorizing Account. This is useful for cases where we want to "sponsor" the Transaction for the user (i.e. pay for their gas fees).

:::code-group

```ts twoslash [example.ts]
import { encodeFunctionData, parseEther } from 'viem'
import { walletClient } from './config'
import { contractAddress } from './contract'

const delegate = privateKeyToAccount('0x...') // [!code ++]

const authorization = await walletClient.signAuthorization({
  contractAddress,
  delegate, // [!code ++]
})

const hash = await walletClient.sendTransaction({
  account: delegate, // [!code ++]
  authorizationList: [authorization],
  data: encodeFunctionData({
    abi,
    functionName: 'execute',
    args: [
      [
        {
          data: '0x',
          to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
          value: parseEther('0.001'),
        },
        {
         data: '0x',
          to: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
          value: parseEther('0.002'),
        },
      ],
    ]
  }),
  to: walletClient.account.address,
})
```

```ts twoslash [config.ts]
// @noErrors
import { createWalletClient, http } from 'viem'
import { anvil } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { eip7702Actions } from 'viem/experimental'

export const account = privateKeyToAccount('0x...')
 
export const walletClient = createWalletClient({
  account,
  chain: anvil,
  transport: http(),
}).extend(eip7702Actions())
```

```ts twoslash [contract.ts] filename="contract.ts"
export const abi = [
  {
    "type": "function",
    "name": "execute",
    "inputs": [
      {
        "name": "calls",
        "type": "tuple[]",
        "components": [
          {
            "name": "data",
            "type": "bytes",
          },
          {
            "name": "to",
            "type": "address",
          },
          {
            "name": "value",
            "type": "uint256",
          }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
] as const

export const contractAddress = '0x...'
```

:::