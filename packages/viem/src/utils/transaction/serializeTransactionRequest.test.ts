import { expect, test } from 'vitest'

import { serializeTransactionRequest } from './serializeTransactionRequest'

test('legacy transaction', () => {
  expect(
    serializeTransactionRequest({
      accessList: undefined,
      data: '0x1',
      from: '0x1',
      gas: 69420420n,
      gasPrice: 69n,
      nonce: 1n,
      to: '0x1',
      value: 1n,
    }),
  ).toMatchInlineSnapshot(`
    {
      "accessList": undefined,
      "data": "0x1",
      "from": "0x1",
      "gas": "0x4234584",
      "gasPrice": "0x45",
      "nonce": "0x1",
      "to": "0x1",
      "value": "0x1",
    }
  `)
})

test('eip2930 transaction', () => {
  expect(
    serializeTransactionRequest({
      accessList: [
        {
          address: '0x1',
          storageKeys: ['0x1'],
        },
      ],
      data: '0x1',
      from: '0x1',
      gas: 69420420n,
      gasPrice: 69n,
      nonce: 1n,
      to: '0x1',
      value: 1n,
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
      "data": "0x1",
      "from": "0x1",
      "gas": "0x4234584",
      "gasPrice": "0x45",
      "nonce": "0x1",
      "to": "0x1",
      "value": "0x1",
    }
  `)
})

test('eip1559 transaction', () => {
  expect(
    serializeTransactionRequest({
      accessList: undefined,
      data: '0x1',
      from: '0x1',
      gas: 69420420n,
      maxFeePerGas: 69n,
      maxPriorityFeePerGas: 69n,
      nonce: 1n,
      to: '0x1',
      value: 1n,
    }),
  ).toMatchInlineSnapshot(`
    {
      "accessList": undefined,
      "data": "0x1",
      "from": "0x1",
      "gas": "0x4234584",
      "maxFeePerGas": "0x45",
      "maxPriorityFeePerGas": "0x45",
      "nonce": "0x1",
      "to": "0x1",
      "value": "0x1",
    }
  `)
})
