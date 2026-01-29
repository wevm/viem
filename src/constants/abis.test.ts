import { expect, test } from 'vitest'

import * as abis from './abis.js'

test('exports abis', () => {
  expect(abis).toMatchInlineSnapshot(`
    {
      "addressResolverAbi": [
        {
          "inputs": [
            {
              "name": "name",
              "type": "bytes32",
            },
          ],
          "name": "addr",
          "outputs": [
            {
              "name": "",
              "type": "address",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "name",
              "type": "bytes32",
            },
            {
              "name": "coinType",
              "type": "uint256",
            },
          ],
          "name": "addr",
          "outputs": [
            {
              "name": "",
              "type": "bytes",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
      ],
      "batchGatewayAbi": [
        {
          "inputs": [
            {
              "components": [
                {
                  "name": "sender",
                  "type": "address",
                },
                {
                  "name": "urls",
                  "type": "string[]",
                },
                {
                  "name": "data",
                  "type": "bytes",
                },
              ],
              "name": "queries",
              "type": "tuple[]",
            },
          ],
          "name": "query",
          "outputs": [
            {
              "name": "failures",
              "type": "bool[]",
            },
            {
              "name": "responses",
              "type": "bytes[]",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "status",
              "type": "uint16",
            },
            {
              "name": "message",
              "type": "string",
            },
          ],
          "name": "HttpError",
          "type": "error",
        },
      ],
      "erc1155Abi": [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "sender",
              "type": "address",
            },
            {
              "internalType": "uint256",
              "name": "balance",
              "type": "uint256",
            },
            {
              "internalType": "uint256",
              "name": "needed",
              "type": "uint256",
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256",
            },
          ],
          "name": "ERC1155InsufficientBalance",
          "type": "error",
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "approver",
              "type": "address",
            },
          ],
          "name": "ERC1155InvalidApprover",
          "type": "error",
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "idsLength",
              "type": "uint256",
            },
            {
              "internalType": "uint256",
              "name": "valuesLength",
              "type": "uint256",
            },
          ],
          "name": "ERC1155InvalidArrayLength",
          "type": "error",
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "operator",
              "type": "address",
            },
          ],
          "name": "ERC1155InvalidOperator",
          "type": "error",
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "receiver",
              "type": "address",
            },
          ],
          "name": "ERC1155InvalidReceiver",
          "type": "error",
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "sender",
              "type": "address",
            },
          ],
          "name": "ERC1155InvalidSender",
          "type": "error",
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "operator",
              "type": "address",
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address",
            },
          ],
          "name": "ERC1155MissingApprovalForAll",
          "type": "error",
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "account",
              "type": "address",
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "operator",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "bool",
              "name": "approved",
              "type": "bool",
            },
          ],
          "name": "ApprovalForAll",
          "type": "event",
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "operator",
              "type": "address",
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "from",
              "type": "address",
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "to",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "uint256[]",
              "name": "ids",
              "type": "uint256[]",
            },
            {
              "indexed": false,
              "internalType": "uint256[]",
              "name": "values",
              "type": "uint256[]",
            },
          ],
          "name": "TransferBatch",
          "type": "event",
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "operator",
              "type": "address",
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "from",
              "type": "address",
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "to",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "id",
              "type": "uint256",
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "value",
              "type": "uint256",
            },
          ],
          "name": "TransferSingle",
          "type": "event",
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "string",
              "name": "value",
              "type": "string",
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "id",
              "type": "uint256",
            },
          ],
          "name": "URI",
          "type": "event",
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "account",
              "type": "address",
            },
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256",
            },
          ],
          "name": "balanceOf",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "internalType": "address[]",
              "name": "accounts",
              "type": "address[]",
            },
            {
              "internalType": "uint256[]",
              "name": "ids",
              "type": "uint256[]",
            },
          ],
          "name": "balanceOfBatch",
          "outputs": [
            {
              "internalType": "uint256[]",
              "name": "",
              "type": "uint256[]",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "account",
              "type": "address",
            },
            {
              "internalType": "address",
              "name": "operator",
              "type": "address",
            },
          ],
          "name": "isApprovedForAll",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address",
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address",
            },
            {
              "internalType": "uint256[]",
              "name": "ids",
              "type": "uint256[]",
            },
            {
              "internalType": "uint256[]",
              "name": "values",
              "type": "uint256[]",
            },
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes",
            },
          ],
          "name": "safeBatchTransferFrom",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address",
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address",
            },
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256",
            },
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256",
            },
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes",
            },
          ],
          "name": "safeTransferFrom",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "operator",
              "type": "address",
            },
            {
              "internalType": "bool",
              "name": "approved",
              "type": "bool",
            },
          ],
          "name": "setApprovalForAll",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [
            {
              "internalType": "bytes4",
              "name": "interfaceId",
              "type": "bytes4",
            },
          ],
          "name": "supportsInterface",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256",
            },
          ],
          "name": "uri",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
      ],
      "erc20Abi": [
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
              "type": "string",
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
              "type": "string",
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
      ],
      "erc20Abi_bytes32": [
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
      ],
      "erc4626Abi": [
        {
          "anonymous": false,
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
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "sender",
              "type": "address",
            },
            {
              "indexed": true,
              "name": "receiver",
              "type": "address",
            },
            {
              "indexed": false,
              "name": "assets",
              "type": "uint256",
            },
            {
              "indexed": false,
              "name": "shares",
              "type": "uint256",
            },
          ],
          "name": "Deposit",
          "type": "event",
        },
        {
          "anonymous": false,
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
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "sender",
              "type": "address",
            },
            {
              "indexed": true,
              "name": "receiver",
              "type": "address",
            },
            {
              "indexed": true,
              "name": "owner",
              "type": "address",
            },
            {
              "indexed": false,
              "name": "assets",
              "type": "uint256",
            },
            {
              "indexed": false,
              "name": "shares",
              "type": "uint256",
            },
          ],
          "name": "Withdraw",
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
          "inputs": [],
          "name": "asset",
          "outputs": [
            {
              "name": "assetTokenAddress",
              "type": "address",
            },
          ],
          "stateMutability": "view",
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
          "inputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
          ],
          "name": "convertToAssets",
          "outputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
          ],
          "name": "convertToShares",
          "outputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
            {
              "name": "receiver",
              "type": "address",
            },
          ],
          "name": "deposit",
          "outputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "caller",
              "type": "address",
            },
          ],
          "name": "maxDeposit",
          "outputs": [
            {
              "name": "maxAssets",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "caller",
              "type": "address",
            },
          ],
          "name": "maxMint",
          "outputs": [
            {
              "name": "maxShares",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "owner",
              "type": "address",
            },
          ],
          "name": "maxRedeem",
          "outputs": [
            {
              "name": "maxShares",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "owner",
              "type": "address",
            },
          ],
          "name": "maxWithdraw",
          "outputs": [
            {
              "name": "maxAssets",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
            {
              "name": "receiver",
              "type": "address",
            },
          ],
          "name": "mint",
          "outputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
          ],
          "name": "previewDeposit",
          "outputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
          ],
          "name": "previewMint",
          "outputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
          ],
          "name": "previewRedeem",
          "outputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
          ],
          "name": "previewWithdraw",
          "outputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
            {
              "name": "receiver",
              "type": "address",
            },
            {
              "name": "owner",
              "type": "address",
            },
          ],
          "name": "redeem",
          "outputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [],
          "name": "totalAssets",
          "outputs": [
            {
              "name": "totalManagedAssets",
              "type": "uint256",
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
              "name": "to",
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
              "name": "from",
              "type": "address",
            },
            {
              "name": "to",
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
        {
          "inputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
            {
              "name": "receiver",
              "type": "address",
            },
            {
              "name": "owner",
              "type": "address",
            },
          ],
          "name": "withdraw",
          "outputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "function",
        },
      ],
      "erc721Abi": [
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
              "indexed": true,
              "name": "tokenId",
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
              "name": "owner",
              "type": "address",
            },
            {
              "indexed": true,
              "name": "operator",
              "type": "address",
            },
            {
              "indexed": false,
              "name": "approved",
              "type": "bool",
            },
          ],
          "name": "ApprovalForAll",
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
              "indexed": true,
              "name": "tokenId",
              "type": "uint256",
            },
          ],
          "name": "Transfer",
          "type": "event",
        },
        {
          "inputs": [
            {
              "name": "spender",
              "type": "address",
            },
            {
              "name": "tokenId",
              "type": "uint256",
            },
          ],
          "name": "approve",
          "outputs": [],
          "stateMutability": "payable",
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
          "inputs": [
            {
              "name": "tokenId",
              "type": "uint256",
            },
          ],
          "name": "getApproved",
          "outputs": [
            {
              "type": "address",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "owner",
              "type": "address",
            },
            {
              "name": "operator",
              "type": "address",
            },
          ],
          "name": "isApprovedForAll",
          "outputs": [
            {
              "type": "bool",
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
              "type": "string",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "tokenId",
              "type": "uint256",
            },
          ],
          "name": "ownerOf",
          "outputs": [
            {
              "name": "owner",
              "type": "address",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "from",
              "type": "address",
            },
            {
              "name": "to",
              "type": "address",
            },
            {
              "name": "tokenId",
              "type": "uint256",
            },
          ],
          "name": "safeTransferFrom",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "from",
              "type": "address",
            },
            {
              "name": "to",
              "type": "address",
            },
            {
              "name": "id",
              "type": "uint256",
            },
            {
              "name": "data",
              "type": "bytes",
            },
          ],
          "name": "safeTransferFrom",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "operator",
              "type": "address",
            },
            {
              "name": "approved",
              "type": "bool",
            },
          ],
          "name": "setApprovalForAll",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [],
          "name": "symbol",
          "outputs": [
            {
              "type": "string",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "index",
              "type": "uint256",
            },
          ],
          "name": "tokenByIndex",
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
              "name": "owner",
              "type": "address",
            },
            {
              "name": "index",
              "type": "uint256",
            },
          ],
          "name": "tokenByIndex",
          "outputs": [
            {
              "name": "tokenId",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "tokenId",
              "type": "uint256",
            },
          ],
          "name": "tokenURI",
          "outputs": [
            {
              "type": "string",
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
              "name": "sender",
              "type": "address",
            },
            {
              "name": "recipient",
              "type": "address",
            },
            {
              "name": "tokeId",
              "type": "uint256",
            },
          ],
          "name": "transferFrom",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function",
        },
      ],
      "multicall3Abi": [
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
      ],
      "smartAccountAbi": [
        {
          "inputs": [
            {
              "name": "hash",
              "type": "bytes32",
            },
            {
              "name": "signature",
              "type": "bytes",
            },
          ],
          "name": "isValidSignature",
          "outputs": [
            {
              "name": "",
              "type": "bytes4",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
      ],
      "textResolverAbi": [
        {
          "inputs": [
            {
              "name": "name",
              "type": "bytes32",
            },
            {
              "name": "key",
              "type": "string",
            },
          ],
          "name": "text",
          "outputs": [
            {
              "name": "",
              "type": "string",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
      ],
      "universalResolverResolveAbi": [
        {
          "inputs": [],
          "name": "ResolverNotFound",
          "type": "error",
        },
        {
          "inputs": [],
          "name": "ResolverWildcardNotSupported",
          "type": "error",
        },
        {
          "inputs": [],
          "name": "ResolverNotContract",
          "type": "error",
        },
        {
          "inputs": [
            {
              "name": "returnData",
              "type": "bytes",
            },
          ],
          "name": "ResolverError",
          "type": "error",
        },
        {
          "inputs": [
            {
              "components": [
                {
                  "name": "status",
                  "type": "uint16",
                },
                {
                  "name": "message",
                  "type": "string",
                },
              ],
              "name": "errors",
              "type": "tuple[]",
            },
          ],
          "name": "HttpError",
          "type": "error",
        },
        {
          "inputs": [
            {
              "name": "name",
              "type": "bytes",
            },
            {
              "name": "data",
              "type": "bytes",
            },
          ],
          "name": "resolve",
          "outputs": [
            {
              "name": "",
              "type": "bytes",
            },
            {
              "name": "address",
              "type": "address",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "name",
              "type": "bytes",
            },
            {
              "name": "data",
              "type": "bytes",
            },
            {
              "name": "gateways",
              "type": "string[]",
            },
          ],
          "name": "resolve",
          "outputs": [
            {
              "name": "",
              "type": "bytes",
            },
            {
              "name": "address",
              "type": "address",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
      ],
      "universalResolverReverseAbi": [
        {
          "inputs": [],
          "name": "ResolverNotFound",
          "type": "error",
        },
        {
          "inputs": [],
          "name": "ResolverWildcardNotSupported",
          "type": "error",
        },
        {
          "inputs": [],
          "name": "ResolverNotContract",
          "type": "error",
        },
        {
          "inputs": [
            {
              "name": "returnData",
              "type": "bytes",
            },
          ],
          "name": "ResolverError",
          "type": "error",
        },
        {
          "inputs": [
            {
              "components": [
                {
                  "name": "status",
                  "type": "uint16",
                },
                {
                  "name": "message",
                  "type": "string",
                },
              ],
              "name": "errors",
              "type": "tuple[]",
            },
          ],
          "name": "HttpError",
          "type": "error",
        },
        {
          "inputs": [
            {
              "name": "reverseName",
              "type": "bytes",
            },
          ],
          "name": "reverse",
          "outputs": [
            {
              "name": "resolvedName",
              "type": "string",
            },
            {
              "name": "resolvedAddress",
              "type": "address",
            },
            {
              "name": "reverseResolver",
              "type": "address",
            },
            {
              "name": "resolver",
              "type": "address",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "reverseName",
              "type": "bytes",
            },
            {
              "name": "gateways",
              "type": "string[]",
            },
          ],
          "name": "reverse",
          "outputs": [
            {
              "name": "resolvedName",
              "type": "string",
            },
            {
              "name": "resolvedAddress",
              "type": "address",
            },
            {
              "name": "reverseResolver",
              "type": "address",
            },
            {
              "name": "resolver",
              "type": "address",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
      ],
      "universalSignatureValidatorAbi": [
        {
          "inputs": [
            {
              "name": "_signer",
              "type": "address",
            },
            {
              "name": "_hash",
              "type": "bytes32",
            },
            {
              "name": "_signature",
              "type": "bytes",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "constructor",
        },
        {
          "inputs": [
            {
              "name": "_signer",
              "type": "address",
            },
            {
              "name": "_hash",
              "type": "bytes32",
            },
            {
              "name": "_signature",
              "type": "bytes",
            },
          ],
          "name": "isValidSig",
          "outputs": [
            {
              "type": "bool",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "function",
        },
      ],
    }
  `)
})
