import { expect, test } from 'vitest'

import {
  deserializeTransactionResult,
  transactionType,
} from './deserializeTransactionResult'

test('transactionType', () => {
  expect(transactionType).toMatchInlineSnapshot(`
    {
      "eip1559": "0x2",
      "eip2930": "0x1",
      "legacy": "0x0",
    }
  `)
})

test('legacy transaction', () => {
  expect(
    deserializeTransactionResult({
      accessList: undefined,
      blockHash: '0x1',
      blockNumber: '0x10f2c',
      from: '0x1',
      gas: '0x4234584',
      gasPrice: '0x45',
      hash: '0x1',
      input: '0x1',
      nonce: '0x1',
      r: '0x1',
      s: '0x1',
      to: '0x1',
      transactionIndex: '0x1',
      type: '0x0',
      v: '0x1',
      value: '0x1',
    }),
  ).toMatchInlineSnapshot(`
    {
      "accessList": undefined,
      "blockHash": "0x1",
      "blockNumber": 69420,
      "from": "0x1",
      "gas": 69420420n,
      "gasPrice": 69n,
      "hash": "0x1",
      "input": "0x1",
      "nonce": 1n,
      "r": "0x1",
      "s": "0x1",
      "to": "0x1",
      "transactionIndex": 1,
      "type": "legacy",
      "v": 1n,
      "value": 1n,
    }
  `)
})

test('eip2930 transaction', () => {
  expect(
    deserializeTransactionResult({
      accessList: [
        {
          address: '0x1',
          storageKeys: ['0x1'],
        },
      ],
      blockHash: '0x1',
      blockNumber: '0x10f2c',
      from: '0x1',
      gas: '0x4234584',
      gasPrice: '0x45',
      hash: '0x1',
      input: '0x1',
      maxFeePerGas: undefined,
      maxPriorityFeePerGas: undefined,
      nonce: '0x1',
      r: '0x1',
      s: '0x1',
      to: '0x1',
      transactionIndex: '0x1',
      type: '0x1',
      v: '0x1',
      value: '0x1',
    }),
  ).toMatchInlineSnapshot(`
    {
      "accessList": [
        {
          "address": "0x1",
          "storageKeys": [
            "0x1",
          ],
        },
      ],
      "blockHash": "0x1",
      "blockNumber": 69420,
      "from": "0x1",
      "gas": 69420420n,
      "gasPrice": 69n,
      "hash": "0x1",
      "input": "0x1",
      "nonce": 1n,
      "r": "0x1",
      "s": "0x1",
      "to": "0x1",
      "transactionIndex": 1,
      "type": "eip2930",
      "v": 1n,
      "value": 1n,
    }
  `)
})

test('eip1559 transaction', () => {
  expect(
    deserializeTransactionResult({
      accessList: [
        {
          address: '0x1',
          storageKeys: ['0x1'],
        },
      ],
      blockHash: '0x1',
      blockNumber: '0x10f2c',
      from: '0x1',
      gas: '0x4234584',
      hash: '0x1',
      input: '0x1',
      maxFeePerGas: '0x5',
      maxPriorityFeePerGas: '0x1',
      nonce: '0x1',
      r: '0x1',
      s: '0x1',
      to: '0x1',
      transactionIndex: '0x1',
      type: '0x2',
      v: '0x1',
      value: '0x1',
    }),
  ).toMatchInlineSnapshot(`
    {
      "accessList": [
        {
          "address": "0x1",
          "storageKeys": [
            "0x1",
          ],
        },
      ],
      "blockHash": "0x1",
      "blockNumber": 69420,
      "from": "0x1",
      "gas": 69420420n,
      "hash": "0x1",
      "input": "0x1",
      "maxFeePerGas": 5n,
      "maxPriorityFeePerGas": 1n,
      "nonce": 1n,
      "r": "0x1",
      "s": "0x1",
      "to": "0x1",
      "transactionIndex": 1,
      "type": "eip1559",
      "v": 1n,
      "value": 1n,
    }
  `)
})

test('pending transaction', () => {
  expect(
    deserializeTransactionResult({
      accessList: [
        {
          address: '0x1',
          storageKeys: ['0x1'],
        },
      ],
      blockHash: null,
      blockNumber: null,
      from: '0x1',
      gas: '0x4234584',
      hash: '0x1',
      input: '0x1',
      maxFeePerGas: '0x5',
      maxPriorityFeePerGas: '0x1',
      nonce: '0x1',
      r: '0x1',
      s: '0x1',
      to: '0x1',
      transactionIndex: null,
      type: '0x2',
      v: '0x1',
      value: '0x1',
    }),
  ).toMatchInlineSnapshot(`
    {
      "accessList": [
        {
          "address": "0x1",
          "storageKeys": [
            "0x1",
          ],
        },
      ],
      "blockHash": null,
      "blockNumber": null,
      "from": "0x1",
      "gas": 69420420n,
      "hash": "0x1",
      "input": "0x1",
      "maxFeePerGas": 5n,
      "maxPriorityFeePerGas": 1n,
      "nonce": 1n,
      "r": "0x1",
      "s": "0x1",
      "to": "0x1",
      "transactionIndex": null,
      "type": "eip1559",
      "v": 1n,
      "value": 1n,
    }
  `)
})
