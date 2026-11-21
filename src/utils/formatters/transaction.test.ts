import { expect, test } from 'vitest'

import { formatTransaction } from './transaction.js'

test('legacy transaction', () => {
  expect(
    formatTransaction({
      accessList: undefined,
      blockHash: '0x1',
      blockNumber: '0x10f2c',
      blockTimestamp: '0x10f2c',
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
      "blockHash": "0x1",
      "blockNumber": 69420n,
      "blockTimestamp": 69420n,
      "chainId": undefined,
      "from": "0x1",
      "gas": 69420420n,
      "gasPrice": 69n,
      "hash": "0x1",
      "input": "0x1",
      "nonce": 1,
      "r": "0x1",
      "s": "0x1",
      "to": "0x1",
      "transactionIndex": 1,
      "type": "legacy",
      "typeHex": "0x0",
      "v": 1n,
      "value": 1n,
    }
  `)
})

test('eip2930 transaction', () => {
  expect(
    formatTransaction({
      accessList: [
        {
          address: '0x1',
          storageKeys: ['0x1'],
        },
      ],
      blockHash: '0x1',
      blockNumber: '0x10f2c',
      chainId: '0x1',
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
      "blockNumber": 69420n,
      "chainId": 1,
      "from": "0x1",
      "gas": 69420420n,
      "gasPrice": 69n,
      "hash": "0x1",
      "input": "0x1",
      "nonce": 1,
      "r": "0x1",
      "s": "0x1",
      "to": "0x1",
      "transactionIndex": 1,
      "type": "eip2930",
      "typeHex": "0x1",
      "v": 1n,
      "value": 1n,
      "yParity": 1,
    }
  `)
})

test('eip1559 transaction', () => {
  expect(
    formatTransaction({
      accessList: [
        {
          address: '0x1',
          storageKeys: ['0x1'],
        },
      ],
      blockHash: '0x1',
      blockNumber: '0x10f2c',
      chainId: '0x1',
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
      v: '0x1b',
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
      "blockNumber": 69420n,
      "chainId": 1,
      "from": "0x1",
      "gas": 69420420n,
      "gasPrice": undefined,
      "hash": "0x1",
      "input": "0x1",
      "maxFeePerGas": 5n,
      "maxPriorityFeePerGas": 1n,
      "nonce": 1,
      "r": "0x1",
      "s": "0x1",
      "to": "0x1",
      "transactionIndex": 1,
      "type": "eip1559",
      "typeHex": "0x2",
      "v": 27n,
      "value": 1n,
      "yParity": 0,
    }
  `)
  expect(
    formatTransaction({
      accessList: [
        {
          address: '0x1',
          storageKeys: ['0x1'],
        },
      ],
      blockHash: '0x1',
      blockNumber: '0x10f2c',
      chainId: '0x1',
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
      v: '0x1c',
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
      "blockNumber": 69420n,
      "chainId": 1,
      "from": "0x1",
      "gas": 69420420n,
      "gasPrice": undefined,
      "hash": "0x1",
      "input": "0x1",
      "maxFeePerGas": 5n,
      "maxPriorityFeePerGas": 1n,
      "nonce": 1,
      "r": "0x1",
      "s": "0x1",
      "to": "0x1",
      "transactionIndex": 1,
      "type": "eip1559",
      "typeHex": "0x2",
      "v": 28n,
      "value": 1n,
      "yParity": 1,
    }
  `)
  expect(
    formatTransaction({
      accessList: [
        {
          address: '0x1',
          storageKeys: ['0x1'],
        },
      ],
      blockHash: '0x1',
      blockNumber: '0x10f2c',
      chainId: '0x1',
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
      v: '0x0',
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
      "blockNumber": 69420n,
      "chainId": 1,
      "from": "0x1",
      "gas": 69420420n,
      "gasPrice": undefined,
      "hash": "0x1",
      "input": "0x1",
      "maxFeePerGas": 5n,
      "maxPriorityFeePerGas": 1n,
      "nonce": 1,
      "r": "0x1",
      "s": "0x1",
      "to": "0x1",
      "transactionIndex": 1,
      "type": "eip1559",
      "typeHex": "0x2",
      "v": 0n,
      "value": 1n,
      "yParity": 0,
    }
  `)
  expect(
    formatTransaction({
      accessList: [
        {
          address: '0x1',
          storageKeys: ['0x1'],
        },
      ],
      blockHash: '0x1',
      blockNumber: '0x10f2c',
      chainId: '0x1',
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
      "blockNumber": 69420n,
      "chainId": 1,
      "from": "0x1",
      "gas": 69420420n,
      "gasPrice": undefined,
      "hash": "0x1",
      "input": "0x1",
      "maxFeePerGas": 5n,
      "maxPriorityFeePerGas": 1n,
      "nonce": 1,
      "r": "0x1",
      "s": "0x1",
      "to": "0x1",
      "transactionIndex": 1,
      "type": "eip1559",
      "typeHex": "0x2",
      "v": 1n,
      "value": 1n,
      "yParity": 1,
    }
  `)
  expect(
    formatTransaction({
      accessList: [
        {
          address: '0x1',
          storageKeys: ['0x1'],
        },
      ],
      blockHash: '0x1',
      blockNumber: '0x10f2c',
      chainId: '0x1',
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
      v: '0x1b',
      value: '0x1',
      yParity: '0x0',
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
      "blockNumber": 69420n,
      "chainId": 1,
      "from": "0x1",
      "gas": 69420420n,
      "gasPrice": undefined,
      "hash": "0x1",
      "input": "0x1",
      "maxFeePerGas": 5n,
      "maxPriorityFeePerGas": 1n,
      "nonce": 1,
      "r": "0x1",
      "s": "0x1",
      "to": "0x1",
      "transactionIndex": 1,
      "type": "eip1559",
      "typeHex": "0x2",
      "v": 27n,
      "value": 1n,
      "yParity": 0,
    }
  `)
  expect(
    formatTransaction({
      accessList: [
        {
          address: '0x1',
          storageKeys: ['0x1'],
        },
      ],
      blockHash: '0x1',
      blockNumber: '0x10f2c',
      chainId: '0x1',
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
      v: '0x1c',
      value: '0x1',
      yParity: '0x1',
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
      "blockNumber": 69420n,
      "chainId": 1,
      "from": "0x1",
      "gas": 69420420n,
      "gasPrice": undefined,
      "hash": "0x1",
      "input": "0x1",
      "maxFeePerGas": 5n,
      "maxPriorityFeePerGas": 1n,
      "nonce": 1,
      "r": "0x1",
      "s": "0x1",
      "to": "0x1",
      "transactionIndex": 1,
      "type": "eip1559",
      "typeHex": "0x2",
      "v": 28n,
      "value": 1n,
      "yParity": 1,
    }
  `)
  expect(
    formatTransaction({
      accessList: [
        {
          address: '0x1',
          storageKeys: ['0x1'],
        },
      ],
      blockHash: '0x1',
      blockNumber: '0x10f2c',
      chainId: '0x1',
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
      v: '0x23',
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
      "blockNumber": 69420n,
      "chainId": 1,
      "from": "0x1",
      "gas": 69420420n,
      "gasPrice": undefined,
      "hash": "0x1",
      "input": "0x1",
      "maxFeePerGas": 5n,
      "maxPriorityFeePerGas": 1n,
      "nonce": 1,
      "r": "0x1",
      "s": "0x1",
      "to": "0x1",
      "transactionIndex": 1,
      "type": "eip1559",
      "typeHex": "0x2",
      "v": 35n,
      "value": 1n,
      "yParity": 0,
    }
  `)
  expect(
    formatTransaction({
      accessList: [
        {
          address: '0x1',
          storageKeys: ['0x1'],
        },
      ],
      blockHash: '0x1',
      blockNumber: '0x10f2c',
      chainId: '0x1',
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
      v: '0x24',
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
      "blockNumber": 69420n,
      "chainId": 1,
      "from": "0x1",
      "gas": 69420420n,
      "gasPrice": undefined,
      "hash": "0x1",
      "input": "0x1",
      "maxFeePerGas": 5n,
      "maxPriorityFeePerGas": 1n,
      "nonce": 1,
      "r": "0x1",
      "s": "0x1",
      "to": "0x1",
      "transactionIndex": 1,
      "type": "eip1559",
      "typeHex": "0x2",
      "v": 36n,
      "value": 1n,
      "yParity": 1,
    }
  `)
})

test('eip4844 transaction', () => {
  expect(
    formatTransaction({
      accessList: [
        {
          address: '0x1',
          storageKeys: ['0x1'],
        },
      ],
      blockHash: '0x1',
      blockNumber: '0x10f2c',
      chainId: '0x1',
      from: '0x1',
      gas: '0x4234584',
      hash: '0x1',
      input: '0x1',
      blobVersionedHashes: [
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      ],
      maxFeePerBlobGas: '0x10',
      maxFeePerGas: '0x5',
      maxPriorityFeePerGas: '0x1',
      nonce: '0x1',
      r: '0x1',
      s: '0x1',
      to: '0x1',
      transactionIndex: '0x1',
      type: '0x3',
      v: '0x1b',
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
      "blobVersionedHashes": [
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      ],
      "blockHash": "0x1",
      "blockNumber": 69420n,
      "chainId": 1,
      "from": "0x1",
      "gas": 69420420n,
      "gasPrice": undefined,
      "hash": "0x1",
      "input": "0x1",
      "maxFeePerBlobGas": 16n,
      "maxFeePerGas": 5n,
      "maxPriorityFeePerGas": 1n,
      "nonce": 1,
      "r": "0x1",
      "s": "0x1",
      "to": "0x1",
      "transactionIndex": 1,
      "type": "eip4844",
      "typeHex": "0x3",
      "v": 27n,
      "value": 1n,
      "yParity": 0,
    }
  `)
})

test('pending transaction', () => {
  expect(
    formatTransaction({
      accessList: [
        {
          address: '0x1',
          storageKeys: ['0x1'],
        },
      ],
      blockHash: null,
      blockNumber: null,
      chainId: '0x1',
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
      "chainId": 1,
      "from": "0x1",
      "gas": 69420420n,
      "gasPrice": undefined,
      "hash": "0x1",
      "input": "0x1",
      "maxFeePerGas": 5n,
      "maxPriorityFeePerGas": 1n,
      "nonce": 1,
      "r": "0x1",
      "s": "0x1",
      "to": "0x1",
      "transactionIndex": null,
      "type": "eip1559",
      "typeHex": "0x2",
      "v": 1n,
      "value": 1n,
      "yParity": 1,
    }
  `)
})

test('nullish values', () => {
  expect(
    formatTransaction({
      accessList: [
        {
          address: '0x1',
          storageKeys: ['0x1'],
        },
      ],
      authorizationList: [],
      blockHash: undefined,
      blockNumber: '0x10f2c',
      from: '0x1',
      gas: undefined,
      hash: '0x1',
      input: '0x1',
      maxFeePerGas: '0x5',
      maxPriorityFeePerGas: '0x1',
      nonce: undefined,
      r: '0x1',
      s: '0x1',
      to: undefined,
      transactionIndex: '0x1',
      type: undefined,
      v: undefined,
      value: undefined,
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
      "authorizationList": [],
      "blockHash": null,
      "blockNumber": 69420n,
      "chainId": undefined,
      "from": "0x1",
      "gas": undefined,
      "gasPrice": undefined,
      "hash": "0x1",
      "input": "0x1",
      "maxFeePerBlobGas": undefined,
      "maxFeePerGas": 5n,
      "maxPriorityFeePerGas": 1n,
      "nonce": undefined,
      "r": "0x1",
      "s": "0x1",
      "to": null,
      "transactionIndex": 1,
      "type": undefined,
      "typeHex": undefined,
      "v": undefined,
      "value": undefined,
      "yParity": undefined,
    }
  `)
})

test('contract deployment transaction', () => {
  expect(
    formatTransaction({
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
      to: undefined,
      transactionIndex: '0x1',
      type: '0x0',
      v: '0x1',
      value: '0x1',
    }),
  ).toMatchInlineSnapshot(`
    {
      "blockHash": "0x1",
      "blockNumber": 69420n,
      "chainId": undefined,
      "from": "0x1",
      "gas": 69420420n,
      "gasPrice": 69n,
      "hash": "0x1",
      "input": "0x1",
      "nonce": 1,
      "r": "0x1",
      "s": "0x1",
      "to": null,
      "transactionIndex": 1,
      "type": "legacy",
      "typeHex": "0x0",
      "v": 1n,
      "value": 1n,
    }
  `)
})

test('behavior: fields a type does not have are left out, in key order', () => {
  const transaction: Record<string, unknown> = {
    yParity: '0x1',
    type: '0x0',
    maxFeePerGas: '0x2',
    accessList: [],
    gas: '0x3',
    hash: '0x4',
    maxFeePerBlobGas: '0x5',
    v: '0x1c',
  }

  expect(
    Object.keys(formatTransaction(transaction as never)),
  ).toMatchInlineSnapshot(`
    [
      "type",
      "gas",
      "hash",
      "v",
      "blockHash",
      "blockNumber",
      "chainId",
      "gasPrice",
      "nonce",
      "to",
      "transactionIndex",
      "typeHex",
      "value",
    ]
  `)
  expect(
    Object.keys(formatTransaction({ ...transaction, type: '0x1' } as never)),
  ).toMatchInlineSnapshot(`
    [
      "yParity",
      "type",
      "accessList",
      "gas",
      "hash",
      "v",
      "blockHash",
      "blockNumber",
      "chainId",
      "gasPrice",
      "nonce",
      "to",
      "transactionIndex",
      "typeHex",
      "value",
    ]
  `)
  expect(
    Object.keys(formatTransaction({ ...transaction, type: '0x2' } as never)),
  ).toMatchInlineSnapshot(`
    [
      "yParity",
      "type",
      "maxFeePerGas",
      "accessList",
      "gas",
      "hash",
      "v",
      "blockHash",
      "blockNumber",
      "chainId",
      "gasPrice",
      "maxPriorityFeePerGas",
      "nonce",
      "to",
      "transactionIndex",
      "typeHex",
      "value",
    ]
  `)
  expect(() =>
    formatTransaction({
      ...transaction,
      maxFeePerBlobGas: '0xzz',
    } as never),
  ).toThrowErrorMatchingInlineSnapshot(
    `[SyntaxError: Cannot convert 0xzz to a BigInt]`,
  )
})

test('behavior: own `__proto__` key', () => {
  const transaction = JSON.parse(
    '{"__proto__":{"polluted":true},"type":"0x0","hash":"0x1"}',
  )

  const formatted = formatTransaction(transaction)

  expect(Object.getPrototypeOf(formatted)).toBe(Object.prototype)
  expect(Object.keys(formatted)).toContain('__proto__')
  expect((formatted as { polluted?: boolean }).polluted).toBeUndefined()
})
