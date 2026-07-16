import { expect, test } from 'vitest'

import { Client, http } from 'viem'

import { bundler } from '~test/bundler.js'
import * as constants from '~test/constants.js'
import { createServer } from '~test/http.js'
import { get } from './get.js'

const client = Client.create({ transport: http(bundler.rpcUrl.http) })
const hash =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
const rpcUserOperation = {
  callData: '0x',
  callGasLimit: '0x1',
  eip7702Auth: {
    address: constants.accounts[2].address,
    chainId: '0x1',
    nonce: '0x2',
    r: '0x01',
    s: '0x02',
    yParity: '0x0',
  },
  maxFeePerGas: '0x2',
  maxPriorityFeePerGas: '0x1',
  nonce: '0x0',
  preVerificationGas: '0x1',
  sender: constants.accounts[1].address,
  signature: '0x',
  verificationGasLimit: '0x1',
} as const

test('error: User Operation not found', { timeout: 15_000 }, async () => {
  await expect(get(client, { hash })).rejects
    .toThrowErrorMatchingInlineSnapshot(`
    [UserOperationNotFoundError: User Operation with hash "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" could not be found.

    Version: viem@2.52.1]
  `)
})

test('formats EntryPoint 0.8 inclusion metadata', async () => {
  const server = await createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        result: {
          blockHash:
            '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          blockNumber: '0x2',
          entryPoint: '0x4337084d9e255ff0702461cf8895ce9e3b5ff108',
          transactionHash:
            '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          userOperation: rpcUserOperation,
        },
      }),
    )
  })

  try {
    const result = await get<'0.8'>(
      Client.create({ transport: http(server.url) }),
      { hash },
    )

    expect(result).toMatchInlineSnapshot(`
      {
        "blockHash": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "blockNumber": 2n,
        "entryPoint": "0x4337084d9e255ff0702461cf8895ce9e3b5ff108",
        "transactionHash": "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "userOperation": {
          "authorization": {
            "address": "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
            "chainId": 1,
            "nonce": 2n,
            "r": "0x0000000000000000000000000000000000000000000000000000000000000001",
            "s": "0x0000000000000000000000000000000000000000000000000000000000000002",
            "yParity": 0,
          },
          "callData": "0x",
          "callGasLimit": 1n,
          "maxFeePerGas": 2n,
          "maxPriorityFeePerGas": 1n,
          "nonce": 0n,
          "preVerificationGas": 1n,
          "sender": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
          "signature": "0x",
          "verificationGasLimit": 1n,
        },
      }
    `)
  } finally {
    await server.close()
  }
})

test('formats pending EntryPoint 0.8 metadata', async () => {
  const server = await createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        result: {
          blockHash: null,
          blockNumber: null,
          entryPoint: '0x4337084d9e255ff0702461cf8895ce9e3b5ff108',
          transactionHash: null,
          userOperation: rpcUserOperation,
        },
      }),
    )
  })

  try {
    const result = await get<'0.8'>(
      Client.create({ transport: http(server.url) }),
      { hash },
    )

    expect({
      blockHash: result.blockHash,
      blockNumber: result.blockNumber,
      entryPoint: result.entryPoint,
      transactionHash: result.transactionHash,
      userOperation: result.userOperation,
    }).toMatchInlineSnapshot(`
      {
        "blockHash": null,
        "blockNumber": null,
        "entryPoint": "0x4337084d9e255ff0702461cf8895ce9e3b5ff108",
        "transactionHash": null,
        "userOperation": {
          "authorization": {
            "address": "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
            "chainId": 1,
            "nonce": 2n,
            "r": "0x0000000000000000000000000000000000000000000000000000000000000001",
            "s": "0x0000000000000000000000000000000000000000000000000000000000000002",
            "yParity": 0,
          },
          "callData": "0x",
          "callGasLimit": 1n,
          "maxFeePerGas": 2n,
          "maxPriorityFeePerGas": 1n,
          "nonce": 0n,
          "preVerificationGas": 1n,
          "sender": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
          "signature": "0x",
          "verificationGasLimit": 1n,
        },
      }
    `)
  } finally {
    await server.close()
  }
})
