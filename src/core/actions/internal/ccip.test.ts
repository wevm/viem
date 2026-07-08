import { AbiConstructor, AbiError, AbiFunction, Hex } from 'ox'
import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import { createCcipServer } from '~test/ccip.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'
import { createServer } from '~test/http.js'
import { describe, expect, test } from 'vitest'

import { Actions, Client, custom } from 'viem'

import { ccipRequest, offchainLookup, offchainLookupAbiError } from './ccip.js'

const client = anvil.getClient(anvil.local)

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

describe('call integration', () => {
  test('resolves an OffchainLookup revert', async () => {
    const server = await createCcipServer()
    const { address } = await deployExample([`${server.url}/{sender}/{data}`])

    const { data } = await Actions.call(client, {
      data: getAddressData('jxom.viem'),
      to: address,
    })

    expect(Hex.trimLeft(data!)).toEqual(constants.accounts[0].address)

    await server.close()
  })

  test('args: client ccipRead disabled', async () => {
    const server = await createCcipServer()
    const { address } = await deployExample([`${server.url}/{sender}/{data}`])

    const disabled = Client.create({
      ccipRead: false,
      transport: custom(
        {
          async request({
            method,
            params,
          }: {
            method: string
            params: unknown
          }) {
            return client.request({ method, params })
          },
        },
        { retryCount: 0 },
      ),
    })

    await expect(
      Actions.call(disabled, {
        data: getAddressData('jxom.viem'),
        to: address,
      }),
    ).rejects.toThrowError()

    await server.close()
  })

  test('args: client ccipRead request override', async () => {
    const server = await createCcipServer()
    const { address } = await deployExample([`${server.url}/{sender}/{data}`])

    const overridden = Client.create({
      ccipRead: {
        async request({ data, sender, urls }) {
          return ccipRequest({ data, sender, urls })
        },
      },
      transport: custom(
        {
          async request({
            method,
            params,
          }: {
            method: string
            params: unknown
          }) {
            return client.request({ method, params })
          },
        },
        { retryCount: 0 },
      ),
    })

    const { data } = await Actions.call(overridden, {
      data: getAddressData('jxom.viem'),
      to: address,
    })

    expect(Hex.trimLeft(data!)).toEqual(constants.accounts[0].address)

    await server.close()
  })

  test('behavior: invalid signature reverts through the callback', async () => {
    const server = await createCcipServer()
    const { address } = await deployExample([`${server.url}/{sender}/{data}`])

    await expect(
      Actions.call(client, {
        data: getAddressData('fake.viem'),
        to: address,
      }),
    ).rejects.toThrowError()

    await server.close()
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

    await expect(
      offchainLookup(client, {
        data,
        to: '0x0000000000000000000000000000000000000001',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [OffchainLookupError: Reverted sender address does not match target contract address (\`to\`).

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

describe('ccipRequest', () => {
  test('default (GET with substitutions)', async () => {
    let url: string | undefined
    const server = await createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      url = req.url
      res.end(JSON.stringify({ data: '0xdeadbeef' }))
    })

    const result = await ccipRequest({
      data: '0xdeadbeef',
      sender: constants.accounts[0].address,
      urls: [`${server.url}/{sender}/{data}`],
    })

    expect(result).toEqual('0xdeadbeef')
    expect(url).toEqual(
      '/0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266/0xdeadbeef',
    )

    await server.close()
  })

  test('behavior: text response', async () => {
    const server = await createServer((_req, res) => {
      res.end('0xcafebabe')
    })

    await expect(
      ccipRequest({
        data: '0xdeadbeef',
        sender: constants.accounts[0].address,
        urls: [`${server.url}/{sender}/{data}`],
      }),
    ).resolves.toEqual('0xcafebabe')

    await server.close()
  })

  test('behavior: http error', async () => {
    const server = await createServer((_req, res) => {
      res.writeHead(500)
      res.end()
    })

    await expect(
      ccipRequest({
        data: '0xdeadbeef',
        sender: constants.accounts[0].address,
        urls: [`${server.url}/{sender}/{data}`],
      }),
    ).rejects.toThrowError('HTTP request failed.')

    await server.close()
  })

  test('behavior: malformed response', async () => {
    const server = await createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ data: 'not hex' }))
    })

    await expect(
      ccipRequest({
        data: '0xdeadbeef',
        sender: constants.accounts[0].address,
        urls: [`${server.url}/{sender}/{data}`],
      }),
    ).rejects.toThrowError(
      'Offchain gateway response is malformed. Response data must be a hex value.',
    )

    await server.close()
  })

  test('behavior: POST method without substitutions', async () => {
    let body = ''
    const server = await createServer((req, res) => {
      req.on('data', (chunk) => {
        body += chunk
      })
      req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ data: '0xcafebabe' }))
      })
    })

    const result = await ccipRequest({
      data: '0xdeadbeef',
      sender: constants.accounts[0].address,
      urls: [server.url],
    })

    expect(result).toEqual('0xcafebabe')
    expect(body).toEqual(
      '{"data":"0xdeadbeef","sender":"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"}',
    )

    await server.close()
  })

  test('behavior: falls through multiple urls', async () => {
    let count = 0
    const failing = await createServer((_req, res) => {
      count++
      res.writeHead(500)
      res.end()
    })
    const succeeding = await createServer((_req, res) => {
      count++
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ data: '0xcafebabe' }))
    })

    const result = await ccipRequest({
      data: '0xdeadbeef',
      sender: constants.accounts[0].address,
      urls: [
        `${failing.url}/{sender}/{data}`,
        `${succeeding.url}/{sender}/{data}`,
      ],
    })

    expect(count).toBe(2)
    expect(result).toEqual('0xcafebabe')

    await failing.close()
    await succeeding.close()
  })

  test('behavior: fetch failure', async () => {
    await expect(
      ccipRequest({
        data: '0xdeadbeef',
        sender: constants.accounts[0].address,
        urls: ['fakeurl'],
      }),
    ).rejects.toThrowError('Failed to parse URL from fakeurl')
  })

  test('behavior: aborts via requestOptions signal', async () => {
    const server = await createServer(async (_req, res) => {
      await new Promise((resolve) => setTimeout(resolve, 1_000))
      res.end(JSON.stringify({ data: '0xcafebabe' }))
    })
    const controller = new AbortController()

    setTimeout(() => controller.abort(), 50)

    await expect(
      ccipRequest({
        data: '0xdeadbeef',
        requestOptions: { signal: controller.signal },
        sender: constants.accounts[0].address,
        urls: [`${server.url}/{sender}/{data}`],
      }),
    ).rejects.toThrowError()

    await server.close()
  })
})
