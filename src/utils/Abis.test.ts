import { expect, test } from 'vitest'

import * as Abis from './Abis.js'

test('exports', () => {
  expect(Object.keys(Abis)).toMatchInlineSnapshot(`
    [
      "erc20",
      "erc20_bytes32",
      "erc721",
      "erc1155",
      "erc4626",
      "multicall3",
    ]
  `)
})

test('erc20_bytes32', () => {
  expect(Abis.erc20_bytes32).toMatchInlineSnapshot(`
    [
      {
        "inputs": [
          {
            "indexed": true,
            "name": "owner",
            "type": "address",
          },
          {
            "indexed": true,
            "name": "spender",
            "type": "address",
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256",
          },
        ],
        "name": "Approval",
        "type": "event",
      },
      {
        "inputs": [
          {
            "indexed": true,
            "name": "from",
            "type": "address",
          },
          {
            "indexed": true,
            "name": "to",
            "type": "address",
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256",
          },
        ],
        "name": "Transfer",
        "type": "event",
      },
      {
        "inputs": [
          {
            "name": "owner",
            "type": "address",
          },
          {
            "name": "spender",
            "type": "address",
          },
        ],
        "name": "allowance",
        "outputs": [
          {
            "type": "uint256",
          },
        ],
        "stateMutability": "view",
        "type": "function",
      },
      {
        "inputs": [
          {
            "name": "spender",
            "type": "address",
          },
          {
            "name": "amount",
            "type": "uint256",
          },
        ],
        "name": "approve",
        "outputs": [
          {
            "type": "bool",
          },
        ],
        "stateMutability": "nonpayable",
        "type": "function",
      },
      {
        "inputs": [
          {
            "name": "account",
            "type": "address",
          },
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "type": "uint256",
          },
        ],
        "stateMutability": "view",
        "type": "function",
      },
      {
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "type": "uint8",
          },
        ],
        "stateMutability": "view",
        "type": "function",
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "type": "bytes32",
          },
        ],
        "stateMutability": "view",
        "type": "function",
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "type": "bytes32",
          },
        ],
        "stateMutability": "view",
        "type": "function",
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "type": "uint256",
          },
        ],
        "stateMutability": "view",
        "type": "function",
      },
      {
        "inputs": [
          {
            "name": "recipient",
            "type": "address",
          },
          {
            "name": "amount",
            "type": "uint256",
          },
        ],
        "name": "transfer",
        "outputs": [
          {
            "type": "bool",
          },
        ],
        "stateMutability": "nonpayable",
        "type": "function",
      },
      {
        "inputs": [
          {
            "name": "sender",
            "type": "address",
          },
          {
            "name": "recipient",
            "type": "address",
          },
          {
            "name": "amount",
            "type": "uint256",
          },
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "type": "bool",
          },
        ],
        "stateMutability": "nonpayable",
        "type": "function",
      },
    ]
  `)
})

test('multicall3', () => {
  expect(Abis.multicall3).toMatchInlineSnapshot(`
    [
      {
        "inputs": [
          {
            "components": [
              {
                "name": "target",
                "type": "address",
              },
              {
                "name": "allowFailure",
                "type": "bool",
              },
              {
                "name": "callData",
                "type": "bytes",
              },
            ],
            "name": "calls",
            "type": "tuple[]",
          },
        ],
        "name": "aggregate3",
        "outputs": [
          {
            "components": [
              {
                "name": "success",
                "type": "bool",
              },
              {
                "name": "returnData",
                "type": "bytes",
              },
            ],
            "name": "returnData",
            "type": "tuple[]",
          },
        ],
        "stateMutability": "view",
        "type": "function",
      },
      {
        "inputs": [
          {
            "name": "addr",
            "type": "address",
          },
        ],
        "name": "getEthBalance",
        "outputs": [
          {
            "name": "balance",
            "type": "uint256",
          },
        ],
        "stateMutability": "view",
        "type": "function",
      },
      {
        "inputs": [],
        "name": "getCurrentBlockTimestamp",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256",
          },
        ],
        "stateMutability": "view",
        "type": "function",
      },
    ]
  `)
})
