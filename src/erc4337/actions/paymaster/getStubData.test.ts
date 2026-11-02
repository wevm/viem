import { AbiParameters, Address, Hex } from 'ox'
import { EntryPoint, UserOperation } from 'ox/erc4337'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { Client, http } from 'viem'
import {
  createVerifyingPaymasterServer,
  deployVerifyingPaymaster07,
} from '~test/account-abstraction.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { createServer } from '~test/http.js'
import { getStubData } from './getStubData.js'

const executionClient = anvil.getClient(anvil.mainnet)

describe('entryPointVersion: 0.7', () => {
  let paymaster: Address.Address
  let server: Awaited<ReturnType<typeof createVerifyingPaymasterServer>>

  beforeAll(async () => {
    if (process.env.OFFLINE) return
    paymaster = await deployVerifyingPaymaster07(executionClient)
    server = await createVerifyingPaymasterServer(executionClient, {
      paymaster,
    })
  })

  afterAll(async () => {
    await server?.close()
  })

  test('default', async () => {
    const client = Client.create({ transport: http(server.url) })
    const operation = {
      callData: '0x',
      callGasLimit: 100_000n,
      maxFeePerGas: 2n,
      maxPriorityFeePerGas: 1n,
      nonce: 0n,
      preVerificationGas: 100_000n,
      sender: constants.accounts[1].address,
      signature: '0x',
      verificationGasLimit: 100_000n,
    } satisfies UserOperation.UserOperation<'0.7', true>
    const context = { validAfter: 1_234, validUntil: 5_678 }

    const result = await getStubData<'0.7'>(client, {
      ...operation,
      chainId: 1,
      context,
      entryPointAddress: EntryPoint.addressV07,
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
        "isFinal": false,
        "paymaster": null,
        "paymasterData": null,
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "sponsor": {
          "name": "Viem Sugar Daddy",
        },
      }
    `)
  })
})

describe('entryPointVersion: 0.6', () => {
  test('metadata', async () => {
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
          entryPoint === EntryPoint.addressV06 &&
          chainId === '0x1'
            ? context.paymasterAndData
            : '0x'
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            result: {
              isFinal: true,
              paymasterAndData,
              sponsor: {
                icon: context.icon,
                name: 'Example Sponsor',
              },
            },
          }),
        )
      })
    })

    try {
      const client = Client.create({ transport: http(server.url) })
      const result = await getStubData<'0.6'>(client, {
        callData: '0xdeadbeef',
        chainId: 1,
        context: {
          icon: 'data:image/svg+xml;base64,PHN2Zy8+',
          paymasterAndData: '0x1234',
        },
        entryPointAddress: EntryPoint.addressV06,
        initCode: '0x',
        nonce: 0n,
        sender: constants.accounts[1].address,
      })

      expect(result).toMatchInlineSnapshot(`
        {
          "isFinal": true,
          "paymasterAndData": "0x1234",
          "sponsor": {
            "icon": "data:image/svg+xml;base64,PHN2Zy8+",
            "name": "Example Sponsor",
          },
        }
      `)
    } finally {
      await server.close()
    }
  })
})
