import { AbiConstructor, AbiError, AbiFunction, Hex } from 'ox'
import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import { createCcipServer } from '~test/ccip.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'
import { describe, expect, test } from 'vitest'

import { Actions, Client, custom, RpcError } from 'viem'
import { CcipRead } from 'viem/utils'

import { offchainLookup } from './ccip.js'

const client = anvil.getClient(anvil.local)
const offchainLookupAbiError = AbiError.from(
  'error OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData)',
)
const transport = custom(
  {
    async request({ method, params }: { method: string; params: unknown }) {
      return client.request({ method, params })
    },
  },
  { retryCount: 0 },
)

async function deployExample(urls: readonly string[]) {
  return await contract.deploy(client, {
    bytecode: AbiConstructor.encode(
      AbiConstructor.fromAbi(generated.OffchainLookupExample.abi),
      {
        args: [urls],
        bytecode: generated.OffchainLookupExample.bytecode.object,
      },
    ),
  })
}

function getAddressData(name: string) {
  return AbiFunction.encodeData(
    AbiFunction.fromAbi(generated.OffchainLookupExample.abi, 'getAddress'),
    [name],
  )
}

const unsafeRequest: CcipRead.Request = (options) =>
  CcipRead.request({ ...options, allowUnsafeUrls: true })

describe('call integration', () => {
  test('args: client ccipRead request', async () => {
    const server = await createCcipServer()
    try {
      const { address } = await deployExample([`${server.url}/{sender}/{data}`])

      const enabled = Client.create({
        ccipRead: { request: unsafeRequest },
        transport,
      })

      const { data } = await Actions.call(enabled, {
        data: getAddressData('jxom.viem'),
        to: address,
      })

      expect(Hex.trimLeft(data!)).toEqual(constants.accounts[0].address)
    } finally {
      await server.close()
    }
  })

  test('args: client ccipRead disabled', async () => {
    const server = await createCcipServer()
    try {
      const { address } = await deployExample([`${server.url}/{sender}/{data}`])

      const disabled = Client.create({
        ccipRead: false,
        transport,
      })
      const error = await Actions.call(disabled, {
        data: getAddressData('jxom.viem'),
        to: address,
      }).catch((error) => error)

      expect(error).toBeInstanceOf(RpcError.ExecutionError)
      expect(error).not.toBeInstanceOf(CcipRead.LookupError)
    } finally {
      await server.close()
    }
  })

  test('args: client ccipRead request override', async () => {
    const server = await createCcipServer()
    try {
      const { address } = await deployExample([
        'http://127.0.0.1:1/{sender}/{data}',
      ])

      const overridden = Client.create({
        ccipRead: {
          async request(options) {
            return CcipRead.request({
              ...options,
              allowUnsafeUrls: true,
              urls: [`${server.url}/{sender}/{data}`],
            })
          },
        },
        transport,
      })

      const { data } = await Actions.call(overridden, {
        data: getAddressData('jxom.viem'),
        to: address,
      })

      expect(Hex.trimLeft(data!)).toEqual(constants.accounts[0].address)
    } finally {
      await server.close()
    }
  })

  test('behavior: invalid signature reverts through the callback', async () => {
    const server = await createCcipServer()
    try {
      const { address } = await deployExample([`${server.url}/{sender}/{data}`])

      const enabled = Client.create({
        ccipRead: { request: unsafeRequest },
        transport,
      })

      await expect(
        Actions.call(enabled, {
          data: getAddressData('fake.viem'),
          to: address,
        }),
      ).rejects.toThrowError()
    } finally {
      await server.close()
    }
  })

  test('behavior: limits recursive lookups', async () => {
    const { address } = await deployExample([
      'data:application/json,{"data":"0x"}',
    ])
    const enabled = Client.create({
      ccipRead: { request: unsafeRequest },
      transport,
    })
    const data = AbiFunction.encodeData(
      AbiFunction.fromAbi(generated.OffchainLookupExample.abi, 'loop'),
    )

    const error = await Actions.call(enabled, { data, to: address }).catch(
      (error) => error,
    )

    expect(error).toBeInstanceOf(CcipRead.LookupLimitExceededError)
    expect(error.limit).toBe(4)
  })
})

describe('offchainLookup', () => {
  test('error: sender check', async () => {
    const data = AbiError.encode(offchainLookupAbiError, [
      '0x0000000000000000000000000000000000000000',
      ['http://localhost'],
      '0xdeadbeef',
      '0xcafebabe',
      '0xdeadbeaf',
    ])

    const error = (await offchainLookup({
      call: (options) => Actions.call(client, options),
      data,
      lookupCount: 0,
      request: CcipRead.request,
      to: '0x0000000000000000000000000000000000000001',
    }).catch((error) => error)) as CcipRead.LookupError

    expect(error).toBeInstanceOf(CcipRead.LookupError)
    expect(error.cause).toBeInstanceOf(CcipRead.SenderMismatchError)
    expect({ cause: error.cause.name, lookup: error.name })
      .toMatchInlineSnapshot(`
        {
          "cause": "CcipRead.SenderMismatchError",
          "lookup": "CcipRead.LookupError",
        }
      `)
    expect(error).toMatchInlineSnapshot(`
      [CcipRead.LookupError: Reverted sender address does not match target contract address (\`to\`).

      Contract address: 0x0000000000000000000000000000000000000001
      OffchainLookup sender address: 0x0000000000000000000000000000000000000000

      Offchain Gateway Call:
        Gateway URL(s):
          http://localhost
        Sender: 0x0000000000000000000000000000000000000000
        Data: 0x556f1830000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000120cafebabe000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000010687474703a2f2f6c6f63616c686f7374000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004deadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004deadbeaf00000000000000000000000000000000000000000000000000000000
        Callback selector: 0xcafebabe
        Extra data: 0xdeadbeaf

      Details: Reverted sender address does not match target contract address (\`to\`).
      Version: viem@2.52.1]
    `)
  })
})
