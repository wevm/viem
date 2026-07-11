import { AbiParameters, Address, Hex } from 'ox'
import { UserOperation } from 'ox/erc4337'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { Client, http } from 'viem'
import {
  createVerifyingPaymasterServer,
  deployVerifyingPaymaster08,
} from '~test/account-abstraction.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { createServer } from '~test/http.js'
import * as EntryPoint from '../../EntryPoint.js'
import { getData } from './getData.js'

const executionClient = anvil.getClient(anvil.mainnet)
const liveTest = process.env.SKIP_GLOBAL_SETUP ? test.skip : test

describe('entryPointVersion: 0.8', () => {
  let paymaster: Address.Address
  let server: Awaited<ReturnType<typeof createVerifyingPaymasterServer>>

  beforeAll(async () => {
    if (process.env.SKIP_GLOBAL_SETUP) return
    paymaster = await deployVerifyingPaymaster08(executionClient)
    server = await createVerifyingPaymasterServer(executionClient, {
      paymaster,
    })
  })

  afterAll(async () => {
    await server?.close()
  })

  liveTest('default', async () => {
    const client = Client.create({ transport: http(server.url) })
    const operation = {
      callData: '0x',
      callGasLimit: 100_000n,
      factory: '0x7702',
      factoryData: '0x',
      maxFeePerGas: 2n,
      maxPriorityFeePerGas: 1n,
      nonce: 0n,
      preVerificationGas: 100_000n,
      sender: constants.accounts[1].address,
      signature: '0x',
      verificationGasLimit: 100_000n,
    } satisfies UserOperation.UserOperation<'0.8', true>
    const context = { validAfter: 1_234, validUntil: 5_678 }

    const result = await getData<'0.8'>(client, {
      ...operation,
      chainId: 1,
      context,
      entryPointAddress: EntryPoint.addressV08,
    })

    const timeRange = AbiParameters.encode(
      [{ type: 'uint48' }, { type: 'uint48' }],
      [context.validUntil, context.validAfter],
    )
    expect(Address.isEqual(result.paymaster, paymaster)).toMatchInlineSnapshot(
      `true`,
    )
    expect(
      Hex.slice(result.paymasterData, 0, Hex.size(timeRange)) === timeRange,
    ).toMatchInlineSnapshot(`true`)
    expect({
      ...result,
      paymaster: null,
      paymasterData: null,
    }).toMatchInlineSnapshot(`
      {
        "paymaster": null,
        "paymasterData": null,
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
      }
    `)
  })

  test('serializes EIP-7702 authorization', async () => {
    let request: unknown
    const server = await createServer((req, res) => {
      let data = ''
      req.on('data', (chunk) => {
        data += chunk
      })
      req.on('end', () => {
        request = JSON.parse(data).params[0]
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            result: {
              paymaster: constants.accounts[2].address,
              paymasterData: '0x',
            },
          }),
        )
      })
    })

    try {
      const client = Client.create({ transport: http(server.url) })
      await getData<'0.8'>(client, {
        authorization: {
          address: constants.accounts[3].address,
          chainId: 1,
          nonce: 2n,
          r: '0x01',
          s: '0x02',
          yParity: 0,
        },
        callData: '0x',
        chainId: 1,
        entryPointAddress: EntryPoint.addressV08,
        nonce: 0n,
        sender: constants.accounts[1].address,
        signature: '0xab',
      })

      expect(request).toMatchInlineSnapshot(`
        {
          "callData": "0x",
          "callGasLimit": "0x0",
          "eip7702Auth": {
            "address": "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
            "chainId": "0x1",
            "nonce": "0x2",
            "r": "0x01",
            "s": "0x02",
            "yParity": "0x0",
          },
          "nonce": "0x0",
          "preVerificationGas": "0x0",
          "sender": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
          "signature": "0xab",
          "verificationGasLimit": "0x0",
        }
      `)
    } finally {
      await server.close()
    }
  })
})

describe('entryPointVersion: 0.6', () => {
  test('paymasterAndData', async () => {
    const server = await createServer((req, res) => {
      let data = ''
      req.on('data', (chunk) => {
        data += chunk
      })
      req.on('end', () => {
        const { params } = JSON.parse(data)
        const [operation, entryPoint, chainId] = params
        const context = params[3]
        const paymasterAndData =
          operation.callGasLimit === '0x0' &&
          operation.preVerificationGas === '0x0' &&
          operation.verificationGasLimit === '0x0' &&
          operation.maxFeePerGas === undefined &&
          operation.maxPriorityFeePerGas === undefined &&
          operation.paymasterAndData === '0xabcd' &&
          entryPoint === EntryPoint.addressV06 &&
          chainId === '0x1'
            ? context.paymasterAndData
            : '0x'
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            result: { paymasterAndData },
          }),
        )
      })
    })

    try {
      const client = Client.create({ transport: http(server.url) })
      const result = await getData<'0.6'>(client, {
        callData: '0xdeadbeef',
        chainId: 1,
        context: { paymasterAndData: '0x1234' },
        entryPointAddress: EntryPoint.addressV06,
        initCode: '0x',
        nonce: 0n,
        paymasterAndData: '0xabcd',
        sender: constants.accounts[1].address,
      })

      expect(result).toMatchInlineSnapshot(`
        {
          "paymasterAndData": "0x1234",
        }
      `)
    } finally {
      await server.close()
    }
  })
})

describe('entryPointVersion: 0.9', () => {
  test('preserves a separate paymaster signature', async () => {
    let request: unknown
    const server = await createServer((req, res) => {
      let data = ''
      req.on('data', (chunk) => {
        data += chunk
      })
      req.on('end', () => {
        request = JSON.parse(data).params[0]
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            result: {
              paymaster: constants.accounts[2].address,
              paymasterData: '0xdeadbeef',
              paymasterSignature: '0xcafebabe',
            },
          }),
        )
      })
    })

    try {
      const client = Client.create({ transport: http(server.url) })
      const result = await getData<'0.9'>(client, {
        callData: '0x',
        chainId: 1,
        entryPointAddress: EntryPoint.addressV09,
        nonce: 0n,
        paymasterSignature: '0xabcd',
        sender: constants.accounts[1].address,
      })

      expect(request).toMatchObject({ paymasterSignature: '0xabcd' })
      expect(result.paymasterSignature).toBe('0xcafebabe')
    } finally {
      await server.close()
    }
  })
})
