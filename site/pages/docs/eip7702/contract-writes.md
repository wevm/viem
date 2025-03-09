# Contract Writes with EIP-7702

The guide below demonstrates how to perform Contract Writes with EIP-7702 to invoke Contract functions on an Externally Owned Account.

## Overview

Here is an end-to-end overview of how to perform a Contract Write to send a batch of Calls. We will break it down into [Steps](#steps) below.

:::code-group

```ts twoslash [example.ts]
import { parseEther } from 'viem'
import { walletClient } from './config'
import { abi, contractAddress } from './contract'

// 1. Authorize designation of the Contract onto the Account.
const authorization = await walletClient.signAuthorization({
  contractAddress,
})

// 2. Invoke the Contract's `execute` function to perform batch calls.
const hash = await walletClient.writeContract({
  abi,
  address: walletClient.account.address,
  functionName: 'execute',
  args: [[
    {
      data: '0x',
      to: '0xcb98643b8786950F0461f3B0edf99D88F274574D', 
      value: parseEther('0.001'), 
    }, {
      data: '0x',
      to: '0xd2135CfB216b74109775236E36d4b433F1DF507B', 
      value: parseEther('0.002'), 
    }
  ]],
  authorizationList: [authorization],
  //                  ↑ 3. Pass the Authorization as an option.
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
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts' 

export const account = privateKeyToAccount('0x...')
 
export const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(),
})
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
    require(address(this) == msg.sender);
    for (uint256 i = 0; i < calls.length; i++) {
      Call memory call = calls[i];
      (bool success, ) = call.to.call{value: call.value}(call.data);
      require(success, "call reverted");
    }
  }
}
```

:::

## Steps

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
    require(address(this) == msg.sender);
    for (uint256 i = 0; i < calls.length; i++) {
      Call memory call = calls[i];
      (bool success, ) = call.to.call{value: call.value}(call.data);
      require(success, "call reverted");
    }
  }
}
```

:::warning

This contract is for demonstration purposes only. Use at your own risk.

:::

### 2. Set up Client & Account

Next, we will need to set up a Client and Externally Owned Account to sign EIP-7702 Authorizations.

```ts twoslash [config.ts]
import { createWalletClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

export const account = privateKeyToAccount('0x...')
 
export const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(),
})
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
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

export const account = privateKeyToAccount('0x...')
 
export const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(),
})
```

:::

### 4. Invoke Contract Function

We can now call the `execute` function on our Contract to perform batch calls.

:::code-group

```ts twoslash [example.ts]
import { parseEther } from 'viem'
import { walletClient } from './config'
import { abi, contractAddress } from './contract'
 
const authorization = await walletClient.signAuthorization({
  contractAddress,
})

const hash = await walletClient.writeContract({ // [!code focus]
  abi, // [!code focus]
  address: walletClient.account.address, // [!code focus]
  functionName: 'execute', // [!code focus]
  args: [[ // [!code focus]
    { // [!code focus]
      data: '0x', // [!code focus]
      to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',  // [!code focus]
      value: parseEther('0.001'),  // [!code focus]
    }, { // [!code focus]
      data: '0x', // [!code focus]
      to: '0xd2135CfB216b74109775236E36d4b433F1DF507B',  // [!code focus]
      value: parseEther('0.002'),  // [!code focus]
    } // [!code focus]
  ]], // [!code focus]
  authorizationList: [authorization], // [!code focus]
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
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

export const account = privateKeyToAccount('0x...')
 
export const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(),
})
```

:::

### 5. Optional: Use a Sponsor

We can also utilize an Sponsor Account to execute a call on behalf of the authorizing Account. This is useful for cases where we want to "sponsor" the Transaction for the user (i.e. pay for their gas fees).

:::code-group

```ts twoslash [example.ts]
import { parseEther } from 'viem'
import { walletClient } from './config'
import { abi, contractAddress } from './contract'

const sponsor = privateKeyToAccount('0x...') // [!code ++]

const authorization = await walletClient.signAuthorization({
  contractAddress,
  sponsor, // [!code ++]
})

const hash = await walletClient.writeContract({
  account: sponsor, // [!code ++]
  abi,
  address: walletClient.account.address,
  functionName: 'execute',
  args: [[
    {
      data: '0x',
      to: '0xcb98643b8786950F0461f3B0edf99D88F274574D', 
      value: parseEther('0.001'), 
    }, {
      data: '0x',
      to: '0xd2135CfB216b74109775236E36d4b433F1DF507B', 
      value: parseEther('0.002'), 
    }
  ]],
  authorizationList: [authorization],
})
```

```ts twoslash [config.ts]
// @noErrors
import { createWalletClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

export const account = privateKeyToAccount('0x...')
 
export const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(),
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

:::
