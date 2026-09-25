import { formatTransaction } from 'viem'
import { expect, test } from 'vitest'

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

test('eip8141 transaction', () => {
  expect(
    formatTransaction({
      blobVersionedHashes: [],
      blockHash: '0x1',
      blockNumber: '0x1',
      chainId: '0x1fcd',
      frames: [
        {
          data: '0x',
          executionGas: '0xc350',
          flags: '0x3',
          mode: '0x1',
          stateGas: '0x0',
          target: null,
          value: '0x0',
        },
        {
          data: '0xdeadbeef',
          executionGas: '0x9c40',
          flags: '0x0',
          mode: '0x2',
          stateGas: '0x64',
          target: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          value: '0x1',
        },
      ],
      from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      gas: '0x1d4c0',
      gasPrice: '0x2',
      hash: '0x2',
      input: '0x',
      maxFeePerBlobGas: '0x0',
      maxFeePerGas: '0xa',
      maxPriorityFeePerGas: '0x1',
      nonce: '0x0',
      signatures: [
        { msg: '0x', scheme: '0x1', signature: '0x', signer: null },
        {
          msg: '0x1111111111111111111111111111111111111111111111111111111111111111',
          scheme: '0x0',
          signature: '0xdeadbeef',
        },
        { msg: '0x', scheme: '0x2', signature: '0x' },
      ],
      to: null,
      transactionIndex: '0x0',
      type: '0x6',
      value: '0x0',
    }),
  ).toMatchInlineSnapshot(`
    {
      "blobVersionedHashes": [],
      "blockHash": "0x1",
      "blockNumber": 1n,
      "chainId": 8141,
      "frames": [
        {
          "data": "0x",
          "executionGas": 50000n,
          "flags": 3,
          "mode": 1,
          "stateGas": 0n,
          "value": 0n,
        },
        {
          "data": "0xdeadbeef",
          "executionGas": 40000n,
          "flags": 0,
          "mode": 2,
          "stateGas": 100n,
          "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
          "value": 1n,
        },
      ],
      "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "gas": 120000n,
      "gasPrice": 2n,
      "hash": "0x2",
      "input": "0x",
      "maxFeePerBlobGas": 0n,
      "maxFeePerGas": 10n,
      "maxPriorityFeePerGas": 1n,
      "nonce": 0,
      "signatures": [
        {
          "payload": "0x",
          "scheme": "secp256k1",
        },
        {
          "payload": "0x1111111111111111111111111111111111111111111111111111111111111111",
          "scheme": "arbitrary",
          "signature": "0xdeadbeef",
        },
        {
          "payload": "0x",
          "scheme": "p256",
        },
      ],
      "to": null,
      "transactionIndex": 0,
      "type": "eip8141",
      "typeHex": "0x6",
      "value": 0n,
    }
  `)
})

test('eip8141 pending transaction', () => {
  expect(
    formatTransaction({ frames: [], signatures: [], type: '0x6' }),
  ).toMatchInlineSnapshot(`
    {
      "blockHash": null,
      "blockNumber": null,
      "chainId": undefined,
      "frames": [],
      "gas": undefined,
      "gasPrice": undefined,
      "maxFeePerBlobGas": undefined,
      "maxFeePerGas": undefined,
      "maxPriorityFeePerGas": undefined,
      "nonce": undefined,
      "signatures": [],
      "to": null,
      "transactionIndex": null,
      "type": "eip8141",
      "typeHex": "0x6",
      "value": undefined,
    }
  `)
})
