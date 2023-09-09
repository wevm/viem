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
      ],
      "universalSignatureValidatorAbi": [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_signer",
              "type": "address",
            },
            {
              "internalType": "bytes32",
              "name": "_hash",
              "type": "bytes32",
            },
            {
              "internalType": "bytes",
              "name": "_signature",
              "type": "bytes",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "constructor",
        },
      ],
    }
  `)
})
