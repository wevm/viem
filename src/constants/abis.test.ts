import { expect, test } from 'vitest'

import * as abis from './abis.js'

test('exports abis', () => {
  expect(abis).toMatchInlineSnapshot(`
    {
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
      "singleAddressResolverAbi": [
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
      "universalResolverAbi": [
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
    }
  `)
})
