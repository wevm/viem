import * as AbiFunction from 'ox/AbiFunction'
import * as Blobs from 'ox/Blobs'
import * as Hex from 'ox/Hex'
import * as Value from 'ox/Value'
import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'
import * as Http from '~test/http.js'
import { kzg } from '~test/kzg.js'
import { afterAll, describe, expect, test } from 'vitest'

import { z } from 'ox/zod'
import {
  Account,
  Actions,
  Chain,
  Client,
  http,
  NodeError,
  NonceManager,
  testActions,
} from 'viem'
import { mainnet } from 'viem/chains'

import { Eip1559FeesNotSupportedError } from '../fee/estimateMaxPriorityFeePerGas.js'
import { MaxFeePerGasTooLowError } from './prepare.js'

const client = anvil.getClient(anvil.mainnet)
const testClient = anvil.getClient(anvil.mainnet).extend(testActions())
const account = constants.accounts[0].address
const to = constants.accounts[1].address

// Pins the next block's base fee so fee-dependent assertions are deterministic.
async function setup() {
  await testClient.block.setNextBaseFeePerGas({
    baseFeePerGas: Value.fromGwei('10'),
  })
  await testClient.block.mine({ blocks: 1 })
}

// Self-hosted ERC-721 used for the execution-reverted path.
const { address: erc721 } = await contract.deploy(client, {
  bytecode: generated.Erc721.bytecode.object,
})
const ownerOfNonexistent = AbiFunction.encodeData(
  AbiFunction.from('function ownerOf(uint256 tokenId) returns (address)'),
  [12517631n],
)

async function readBody(req: {
  on: (event: string, fn: (chunk: any) => void) => void
}) {
  return await new Promise<string>((resolve) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => resolve(data))
  })
}

// A real HTTP server that proxies to anvil, but rejects `eth_fillTransaction`
// with a configurable error — exercising the manual (no-fill) preparation path.
function createFallback(error: { code: number; message: string }) {
  return Http.createServer(async (req, res) => {
    const body = await readBody(req)
    const payload = JSON.parse(body)
    res.setHeader('Content-Type', 'application/json')
    if (payload.method === 'eth_fillTransaction') {
      res.end(JSON.stringify({ id: payload.id, jsonrpc: '2.0', error }))
      return
    }
    const response = await fetch(anvil.mainnet.rpcUrl.http, {
      body,
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    res.end(await response.text())
  })
}

// A real HTTP server that proxies to anvil and counts how many times
// `eth_fillTransaction` was requested — lets us assert whether `prepare`
// attempted a fill without mocking. `reject` forces fill to fail.
async function createCounter(reject?: { code: number; message: string }) {
  const state = { calls: 0 }
  const server = await Http.createServer(async (req, res) => {
    const body = await readBody(req)
    const payload = JSON.parse(body)
    res.setHeader('Content-Type', 'application/json')
    if (payload.method === 'eth_fillTransaction') {
      state.calls++
      if (reject) {
        res.end(
          JSON.stringify({ id: payload.id, jsonrpc: '2.0', error: reject }),
        )
        return
      }
    }
    const response = await fetch(anvil.mainnet.rpcUrl.http, {
      body,
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    res.end(await response.text())
  })
  return { ...server, state }
}

// A real HTTP server that proxies to anvil but returns a fixed
// `eth_fillTransaction` result — exercising the fill-result merge path.
async function createFillServer(result: unknown) {
  return await Http.createServer(async (req, res) => {
    const body = await readBody(req)
    const payload = JSON.parse(body)
    res.setHeader('Content-Type', 'application/json')
    if (payload.method === 'eth_fillTransaction') {
      res.end(JSON.stringify({ id: payload.id, jsonrpc: '2.0', result }))
      return
    }
    const response = await fetch(anvil.mainnet.rpcUrl.http, {
      body,
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    res.end(await response.text())
  })
}

const server = await createFallback({
  code: -32601,
  message: 'method not found',
})
const fallbackClient = Client.create({ transport: http(server.url) })

const counter = await createCounter()
// Returns whether `prepare` attempted an `eth_fillTransaction` for `options`.
async function attemptedFill(options: Record<string, unknown>) {
  counter.state.calls = 0
  const client = Client.create({ transport: http(counter.url) })
  await Actions.transaction.prepare(client, {
    account,
    to,
    value: 1n,
    ...options,
  } as never)
  return counter.state.calls > 0
}

afterAll(async () => {
  await server.close()
  await counter.close()
})

describe.each([
  ['json-rpc (Account.from)', Account.from(account)],
  [
    'local (Account.fromPrivateKey)',
    Account.fromPrivateKey(constants.accounts[0].privateKey),
  ],
] as const)('account: %s', (_name, account) => {
  test('prepares a transaction request', async () => {
    const { capabilities, request } = await Actions.transaction.prepare(
      client,
      {
        account,
        to,
        value: 1n,
      },
    )

    const {
      account: _account,
      from,
      gas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      ...rest
    } = request

    expect(capabilities).toBeUndefined()
    expect((from as string).toLowerCase()).toBe(account)
    expect(gas).toBeTypeOf('bigint')
    expect(maxFeePerGas).toBeTypeOf('bigint')
    expect(maxPriorityFeePerGas).toBeTypeOf('bigint')
    expect(nonce).toBeTypeOf('number')
    expect(rest).toMatchInlineSnapshot(`
      {
        "chainId": 1,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1n,
      }
    `)
  })

  test('args: nonce', async () => {
    const { request } = await Actions.transaction.prepare(client, {
      account,
      nonce: 5,
      to,
      value: 1n,
    })
    expect(request.nonce).toBe(5)
  })

  test('args: chainId', async () => {
    const { request } = await Actions.transaction.prepare(client, {
      account,
      chainId: 1,
      to,
      value: 1n,
    })
    expect(request.chainId).toBe(1)
  })

  test('args: gas', async () => {
    const { request } = await Actions.transaction.prepare(client, {
      account,
      gas: 50_000n,
      to,
      value: 1n,
    })
    expect(request.gas).toBe(50_000n)
  })

  test('args: type (legacy)', async () => {
    const { request } = await Actions.transaction.prepare(client, {
      account,
      to,
      type: 'legacy',
      value: 1n,
    })
    expect(request.type).toBe('legacy')
    expect(request.gasPrice).toBeTypeOf('bigint')
    expect(request.maxFeePerGas).toBeUndefined()
    expect(request.maxPriorityFeePerGas).toBeUndefined()
  })

  test('args: fees (supplied)', async () => {
    const { request } = await Actions.transaction.prepare(client, {
      account,
      maxFeePerGas: 10_000_000_000n,
      maxPriorityFeePerGas: 1_000_000_000n,
      to,
      value: 1n,
    })
    expect(request.maxFeePerGas).toBe(10_000_000_000n)
    expect(request.maxPriorityFeePerGas).toBe(1_000_000_000n)
    expect(request.type).toBe('eip1559')
  })
})

describe('args', () => {
  test('parameters (nonce only)', async () => {
    const { request } = await Actions.transaction.prepare(client, {
      account,
      parameters: ['nonce'],
      to,
      value: 1n,
    })
    const { nonce, ...rest } = request
    expect(nonce).toBeTypeOf('number')
    expect(rest).toMatchInlineSnapshot(`
    {
      "account": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      "value": 1n,
    }
  `)
  })

  test('parameters (empty)', async () => {
    const { request } = await Actions.transaction.prepare(client, {
      account,
      parameters: [],
      to,
      value: 1n,
    })
    expect(request).toMatchInlineSnapshot(`
    {
      "account": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      "value": 1n,
    }
  `)
  })

  test('type inference from request shape', async () => {
    const eip7702 = await Actions.transaction.prepare(client, {
      account,
      authorizationList: [],
      parameters: ['type'],
      to,
      value: 1n,
    })
    expect(eip7702.request.type).toBe('eip7702')

    const eip4844 = await Actions.transaction.prepare(client, {
      account,
      maxFeePerBlobGas: 1n,
      parameters: ['type'],
      to,
      value: 1n,
    })
    expect(eip4844.request.type).toBe('eip4844')

    const eip2930 = await Actions.transaction.prepare(client, {
      accessList: [],
      account,
      gasPrice: 1n,
      parameters: ['type'],
      to,
      value: 1n,
    })
    expect(eip2930.request.type).toBe('eip2930')

    const legacy = await Actions.transaction.prepare(client, {
      account,
      gasPrice: 1n,
      parameters: ['type'],
      to,
      value: 1n,
    })
    expect(legacy.request.type).toBe('legacy')
  })

  test('type (legacy) estimates gasPrice on manual path', async () => {
    const { request } = await Actions.transaction.prepare(fallbackClient, {
      account,
      to,
      type: 'legacy',
      value: 1n,
    })
    expect(request.type).toBe('legacy')
    expect(request.gasPrice).toBeTypeOf('bigint')
  })

  test('blobs derive versionedHashes and sidecars', async () => {
    const blobs = Blobs.from(Hex.fromString('hello viem'))
    const { request } = await Actions.transaction.prepare(client, {
      account,
      blobs,
      kzg,
      parameters: ['blobVersionedHashes', 'sidecars'],
      to,
    })
    expect(Array.isArray(request.blobVersionedHashes)).toBe(true)
    expect((request.blobVersionedHashes as readonly string[]).length).toBe(
      blobs.length,
    )
    expect(request.sidecars).toBeDefined()
  })

  test('chainId on chainless client', async () => {
    const chainless = Client.create({
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const { request } = await Actions.transaction.prepare(chainless, {
      account,
      chainId: 1,
      nonceManager: NonceManager.from({ source: NonceManager.jsonRpc() }),
      to,
      value: 1n,
    })
    expect(request.chainId).toBe(1)
  })

  test('maxPriorityFeePerGas', async () => {
    await setup()

    const { request } = await Actions.transaction.prepare(fallbackClient, {
      account,
      maxPriorityFeePerGas: Value.fromGwei('5'),
      to,
      value: 1n,
    })
    expect(request.maxPriorityFeePerGas).toBe(Value.fromGwei('5'))
    expect(request.maxFeePerGas).toBeTypeOf('bigint')
    expect(request.type).toBe('eip1559')
  })

  test('maxPriorityFeePerGas === 0', async () => {
    await setup()

    const { request } = await Actions.transaction.prepare(fallbackClient, {
      account,
      maxPriorityFeePerGas: 0n,
      to,
      value: 1n,
    })
    expect(request.maxPriorityFeePerGas).toBe(0n)
    expect(request.maxFeePerGas).toBeTypeOf('bigint')
    expect(request.type).toBe('eip1559')
  })

  test('gasPrice', async () => {
    await setup()

    const { request } = await Actions.transaction.prepare(client, {
      account,
      gasPrice: Value.fromGwei('10'),
      to,
      value: 1n,
    })
    expect(request.gasPrice).toBe(Value.fromGwei('10'))
    expect(request.type).toBe('legacy')
    expect(request.maxFeePerGas).toBeUndefined()
  })

  test('account (local Account, manual path)', async () => {
    const localAccount = Account.fromPrivateKey(
      constants.accounts[0].privateKey,
    )
    const { request } = await Actions.transaction.prepare(fallbackClient, {
      account: localAccount,
      to,
      value: 1n,
    })
    expect((request.account as Account.Account).address.toLowerCase()).toBe(
      account,
    )
    expect((request.from as string).toLowerCase()).toBe(account)
  })

  test('maxFeePerGas (manual path)', async () => {
    await setup()
    const { request } = await Actions.transaction.prepare(fallbackClient, {
      account,
      maxFeePerGas: Value.fromGwei('100'),
      to,
      value: 1n,
    })
    expect(request.maxFeePerGas).toBe(Value.fromGwei('100'))
    expect(request.maxPriorityFeePerGas).toBeTypeOf('bigint')
    expect(request.type).toBe('eip1559')
  })

  test('type (eip1559)', async () => {
    await setup()
    const { request } = await Actions.transaction.prepare(fallbackClient, {
      account,
      to,
      type: 'eip1559',
      value: 1n,
    })
    expect(request.type).toBe('eip1559')
    expect(request.maxFeePerGas).toBeTypeOf('bigint')
    expect(request.maxPriorityFeePerGas).toBeTypeOf('bigint')
  })
})

describe('behavior: attemptFill', () => {
  test('attempt fill when maxFeePerGas set but maxPriorityFeePerGas missing', async () => {
    const { request } = await Actions.transaction.prepare(client, {
      account,
      maxFeePerGas: Value.fromGwei('100'),
      parameters: ['fees', 'gas'],
      to,
      value: 1n,
    })
    expect(request.maxFeePerGas).toBe(Value.fromGwei('100'))
    expect(request.maxPriorityFeePerGas).toBeTypeOf('bigint')
    expect(request.gas).toBeTypeOf('bigint')
  })

  test('not when supportsFill is false', async () => {
    // First prepare against a node that rejects fill caches `supportsFill: false`;
    // the second prepare must not re-attempt the fill.
    const rejecter = await createCounter({
      code: -32601,
      message: 'method not found',
    })
    try {
      const c = Client.create({ transport: http(rejecter.url) })
      await Actions.transaction.prepare(c, { account, to, value: 1n })
      expect(rejecter.state.calls).toBe(1)
      await Actions.transaction.prepare(c, { account, to, value: 1n })
      expect(rejecter.state.calls).toBe(1)
    } finally {
      await rejecter.close()
    }
  })

  test('not when all parameters provided', async () => {
    expect(
      await attemptedFill({
        chainId: 1,
        gas: 21000n,
        maxFeePerGas: Value.fromGwei('100'),
        maxPriorityFeePerGas: Value.fromGwei('5'),
        nonce: 5,
      }),
    ).toBe(false)
  })

  test('not when parameters exclude fees and gas', async () => {
    expect(
      await attemptedFill({ parameters: ['nonce', 'chainId', 'type'] }),
    ).toBe(false)
  })

  test('not when chainId provided', async () => {
    expect(await attemptedFill({ chainId: 1, parameters: ['chainId'] })).toBe(
      false,
    )
  })

  test('not when nonce provided', async () => {
    expect(await attemptedFill({ nonce: 5, parameters: ['nonce'] })).toBe(false)
  })

  test('not when gasPrice provided', async () => {
    expect(
      await attemptedFill({
        gasPrice: Value.fromGwei('10'),
        parameters: ['fees'],
      }),
    ).toBe(false)
  })

  test('not when both fee caps provided', async () => {
    expect(
      await attemptedFill({
        maxFeePerGas: Value.fromGwei('100'),
        maxPriorityFeePerGas: Value.fromGwei('5'),
        parameters: ['fees'],
      }),
    ).toBe(false)
  })

  test('when only maxFeePerGas provided', async () => {
    expect(
      await attemptedFill({
        maxFeePerGas: Value.fromGwei('100'),
        parameters: ['fees'],
      }),
    ).toBe(true)
  })

  test('not when gas provided', async () => {
    expect(
      await attemptedFill({
        gas: 21000n,
        maxFeePerGas: Value.fromGwei('100'),
        maxPriorityFeePerGas: Value.fromGwei('5'),
        parameters: ['gas'],
      }),
    ).toBe(false)
  })

  test('when gas missing', async () => {
    expect(
      await attemptedFill({
        chainId: 1,
        maxFeePerGas: Value.fromGwei('100'),
        maxPriorityFeePerGas: Value.fromGwei('5'),
        nonce: 5,
        parameters: ['gas'],
      }),
    ).toBe(true)
  })

  test('not when blobs+kzg with blobVersionedHashes', async () => {
    const blobs = Blobs.from(Hex.fromString('hello viem'))
    expect(
      await attemptedFill({
        blobs,
        kzg,
        maxFeePerBlobGas: Value.fromGwei('20'),
        parameters: ['blobVersionedHashes', 'gas'],
      }),
    ).toBe(false)
  })

  test('not when blobs+kzg with sidecars', async () => {
    const blobs = Blobs.from(Hex.fromString('hello viem'))
    expect(
      await attemptedFill({
        blobs,
        gas: 21000n,
        kzg,
        maxFeePerBlobGas: Value.fromGwei('20'),
        parameters: ['gas', 'sidecars'],
      }),
    ).toBe(false)
  })

  test('not when blobVersionedHashes set but blobs/kzg missing', async () => {
    expect(
      await attemptedFill({
        gas: 21000n,
        maxFeePerGas: Value.fromGwei('100'),
        maxPriorityFeePerGas: Value.fromGwei('5'),
        parameters: ['blobVersionedHashes', 'fees'],
      }),
    ).toBe(false)
  })

  test('when blobVersionedHashes set without blobs/kzg but gas missing', async () => {
    expect(
      await attemptedFill({ parameters: ['blobVersionedHashes', 'gas'] }),
    ).toBe(true)
  })
})

describe('behavior: fill result', () => {
  test('merges chain-specific fields returned by fill', async () => {
    const filled = {
      chainId: '0x1',
      from: account,
      gas: '0x5208',
      maxFeePerGas: '0x77359400',
      maxPriorityFeePerGas: '0x3b9aca00',
      nonce: '0x0',
      to,
      type: '0x2',
      value: '0x1',
      // A chain-specific field the node returns that prepare should preserve.
      feeToken: '0x000000000000000000000000000000000000dEaD',
    }
    const blobServer = await Http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          result: { raw: '0x02deadbeef', tx: filled },
        }),
      )
    })
    try {
      const fillClient = Client.create({ transport: http(blobServer.url) })
      const { request } = await Actions.transaction.prepare(fillClient, {
        account,
        to,
        value: 1n,
      })
      expect((request as Record<string, unknown>).feeToken).toBe(
        '0x000000000000000000000000000000000000dEaD',
      )
    } finally {
      await blobServer.close()
    }
  })

  test('merges only the fields the node returns', async () => {
    // A minimal fill result (only `type`) forces every optional merge to take its
    // "field absent" branch; the remaining fields are filled manually afterwards.
    const fillServer = await createFillServer({
      raw: '0x02deadbeef',
      tx: { type: '0x2' },
    })
    try {
      const fillClient = Client.create({ transport: http(fillServer.url) })
      const { request } = await Actions.transaction.prepare(fillClient, {
        account,
        to,
        value: 1n,
      })
      expect(request.type).toBe('eip1559')
      expect(request.chainId).toBe(1)
      expect(request.gas).toBeTypeOf('bigint')
      expect(request.nonce).toBeTypeOf('number')
      expect(request.maxFeePerGas).toBeTypeOf('bigint')
      expect(request.maxPriorityFeePerGas).toBeTypeOf('bigint')
      expect(request.from?.toString().toLowerCase()).toBe(account)
    } finally {
      await fillServer.close()
    }
  })

  test('merges maxFeePerBlobGas from an eip4844 fill', async () => {
    const fillServer = await createFillServer({
      raw: '0x03deadbeef',
      tx: {
        chainId: '0x1',
        from: account,
        gas: '0x5208',
        maxFeePerBlobGas: '0x1',
        maxFeePerGas: '0x77359400',
        maxPriorityFeePerGas: '0x3b9aca00',
        nonce: '0x0',
        to,
        type: '0x3',
        value: '0x1',
      },
    })
    try {
      const fillClient = Client.create({ transport: http(fillServer.url) })
      const { request } = await Actions.transaction.prepare(fillClient, {
        account,
        to,
        value: 1n,
      })
      expect((request as Record<string, unknown>).maxFeePerBlobGas).toBe(1n)
      expect(request.type).toBe('eip4844')
    } finally {
      await fillServer.close()
    }
  })

  test('passes through node capabilities', async () => {
    const fillServer = await createFillServer({
      capabilities: { autoSwap: { calls: [] } },
      raw: '0x02deadbeef',
      tx: {
        chainId: '0x1',
        from: account,
        gas: '0x5208',
        maxFeePerGas: '0x77359400',
        maxPriorityFeePerGas: '0x3b9aca00',
        nonce: '0x0',
        to,
        type: '0x2',
        value: '0x1',
      },
    })
    try {
      const fillClient = Client.create({ transport: http(fillServer.url) })
      const { capabilities } = await Actions.transaction.prepare(fillClient, {
        account,
        to,
        value: 1n,
      })
      expect(capabilities).toEqual({ autoSwap: { calls: [] } })
    } finally {
      await fillServer.close()
    }
  })

  test('merges only present fields from a sparse chain schema', async () => {
    // A custom `schema.transaction.fromRpc` that drops every field except `type`,
    // combined with a no-account request (so fill yields no `from`), forces the
    // merge to take the "field absent" branch for from/gas/nonce/chainId.
    const fillServer = await createFillServer({
      raw: '0x02deadbeef',
      tx: {
        accessList: [],
        blockHash: `0x${'00'.repeat(32)}`,
        blockNumber: '0x1',
        chainId: '0x1',
        from: account,
        gas: '0x5208',
        hash: `0x${'11'.repeat(32)}`,
        input: '0x',
        maxFeePerGas: '0x77359400',
        maxPriorityFeePerGas: '0x3b9aca00',
        nonce: '0x0',
        r: `0x${'22'.repeat(32)}`,
        s: `0x${'33'.repeat(32)}`,
        to,
        transactionIndex: '0x0',
        type: '0x2',
        v: '0x1',
        value: '0x1',
        yParity: '0x1',
      },
    })
    const chain = mainnet.extend({
      rpcUrls: { default: { http: [fillServer.url] } },
      schema: {
        transaction: {
          fromRpc: z.pipe(
            z.Transaction.Transaction,
            z.transform(() => ({ type: 'eip1559' as const })),
          ),
        },
      },
    })
    try {
      const sparseClient = Client.create({
        chain,
        transport: http(fillServer.url),
      })
      const { request } = await Actions.transaction.prepare(sparseClient, {
        to,
        value: 1n,
      })
      expect(request.account).toBeUndefined()
      expect(request.from).toBeUndefined()
      expect(request.type).toBe('eip1559')
      // The dropped fields are populated manually after the merge.
      expect(request.chainId).toBe(1)
      expect(request.gas).toBeTypeOf('bigint')
      expect(request.maxFeePerGas).toBeTypeOf('bigint')
    } finally {
      await fillServer.close()
    }
  })

  test('only allowlisted chain-specific fields are carried through', async () => {
    const fillServer = await createFillServer({
      raw: '0x02deadbeef',
      tx: {
        chainId: '0x1',
        from: account,
        gas: '0x5208',
        maxFeePerGas: '0x77359400',
        maxPriorityFeePerGas: '0x3b9aca00',
        nonce: '0x0',
        to,
        type: '0x2',
        value: '0x1',
        feeToken: '0x000000000000000000000000000000000000dEaD',
        feePayerSignature: null,
        calls: [
          { to: '0x0000000000000000000000000000000000000001', data: '0x' },
        ],
      },
    })
    try {
      const fillClient = Client.create({ transport: http(fillServer.url) })
      const { request } = await Actions.transaction.prepare(fillClient, {
        account,
        to,
        value: 1n,
      })
      expect((request as Record<string, unknown>).feeToken).toBe(
        '0x000000000000000000000000000000000000dEaD',
      )
      // Null allowlisted field is skipped.
      expect('feePayerSignature' in request).toBe(false)
      // Non-allowlisted node field is never carried into the request.
      expect('calls' in request).toBe(false)
    } finally {
      await fillServer.close()
    }
  })
})

describe('behavior: fill fallback', () => {
  test('fallback when eth_fillTransaction unsupported', async () => {
    const { request } = await Actions.transaction.prepare(fallbackClient, {
      account,
      to,
      value: 1n,
    })

    expect(request.chainId).toBe(1)
    expect(request.gas).toBeTypeOf('bigint')
    expect(request.nonce).toBeTypeOf('number')
    expect(request.type).toBe('eip1559')
    expect(request.maxFeePerGas).toBeTypeOf('bigint')
    expect(request.maxPriorityFeePerGas).toBeTypeOf('bigint')
  })

  test('unsupported fill via error code -32004', async () => {
    const variant = await createFallback({
      code: -32004,
      message: 'method not supported',
    })
    try {
      const variantClient = Client.create({ transport: http(variant.url) })
      const { request } = await Actions.transaction.prepare(variantClient, {
        account,
        to,
        value: 1n,
      })
      expect(request.chainId).toBe(1)
      expect(request.gas).toBeTypeOf('bigint')
    } finally {
      await variant.close()
    }
  })

  test('unsupported fill via error message', async () => {
    const variant = await createFallback({
      code: -32000,
      message: 'the method eth_fillTransaction does not exist',
    })
    try {
      const variantClient = Client.create({ transport: http(variant.url) })
      const { request } = await Actions.transaction.prepare(variantClient, {
        account,
        to,
        value: 1n,
      })
      expect(request.chainId).toBe(1)
      expect(request.gas).toBeTypeOf('bigint')
    } finally {
      await variant.close()
    }
  })

  test('unsupported fill via "is not available" message', async () => {
    const variant = await createFallback({
      code: -32000,
      message: 'eth_fillTransaction is not available',
    })
    try {
      const variantClient = Client.create({ transport: http(variant.url) })
      const { request } = await Actions.transaction.prepare(variantClient, {
        account,
        to,
        value: 1n,
      })
      expect(request.gas).toBeTypeOf('bigint')
    } finally {
      await variant.close()
    }
  })

  test('unsupported fill via "method not supported" message', async () => {
    const variant = await createFallback({
      code: -32000,
      message: 'the method eth_fillTransaction is not supported by this node',
    })
    try {
      const variantClient = Client.create({ transport: http(variant.url) })
      const { request } = await Actions.transaction.prepare(variantClient, {
        account,
        to,
        value: 1n,
      })
      expect(request.gas).toBeTypeOf('bigint')
    } finally {
      await variant.close()
    }
  })

  test('falls back when fill fails with a generic error', async () => {
    // A non-revert, non-abort, non-unsupported fill error is swallowed; `prepare`
    // falls back to the manual path.
    const variant = await createFallback({
      code: -32000,
      message: 'intrinsic gas too low',
    })
    try {
      const variantClient = Client.create({ transport: http(variant.url) })
      const { request } = await Actions.transaction.prepare(variantClient, {
        account,
        to,
        value: 1n,
      })
      expect(request.gas).toBeTypeOf('bigint')
      expect(request.type).toBe('eip1559')
    } finally {
      await variant.close()
    }
  })
})

describe('behavior: chain hooks', () => {
  test('chain hook (beforeFillTransaction)', async () => {
    const chain = Chain.from({
      id: 1,
      name: 'Ethereum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
      prepareTransactionRequest(request) {
        return { ...request, value: 69n }
      },
    })
    const hookClient = Client.create({
      chain,
      transport: http(anvil.mainnet.rpcUrl.http),
    })

    const { request } = await Actions.transaction.prepare(hookClient, {
      account,
      to,
      value: 1n,
    })
    expect(request.value).toBe(69n)
  })

  test('chain hook (runAt phases)', async () => {
    const phases: string[] = []
    const chain = Chain.from({
      id: 1,
      name: 'Ethereum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
      prepareTransactionRequest: [
        (request, { phase }) => {
          phases.push(phase)
          return request
        },
        { runAt: ['beforeFillTransaction', 'afterFillParameters'] },
      ],
    })
    const hookClient = Client.create({
      chain,
      transport: http(anvil.mainnet.rpcUrl.http),
    })

    await Actions.transaction.prepare(hookClient, { account, to, value: 1n })
    expect(phases).toEqual(['beforeFillTransaction', 'afterFillParameters'])
  })

  test('chain hook (beforeFillParameters)', async () => {
    const chain = Chain.from({
      id: 1,
      name: 'Ethereum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
      prepareTransactionRequest: [
        (request) => ({ ...request, value: 42n }),
        { runAt: ['beforeFillParameters'] },
      ],
    })
    const hookClient = Client.create({
      chain,
      transport: http(anvil.mainnet.rpcUrl.http),
    })

    const { request } = await Actions.transaction.prepare(hookClient, {
      account,
      to,
      value: 1n,
    })
    expect(request.value).toBe(42n)
  })

  test('chain hook modifying gas', async () => {
    const chain = Chain.from({
      id: 1,
      name: 'Ethereum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
      prepareTransactionRequest(request) {
        return { ...request, gas: 50_000n }
      },
    })
    const hookClient = Client.create({
      chain,
      transport: http(anvil.mainnet.rpcUrl.http),
    })

    const { request } = await Actions.transaction.prepare(hookClient, {
      account,
      parameters: ['fees', 'nonce', 'type'],
      to,
      value: 1n,
    })
    expect((request as Record<string, unknown>).gas).toBe(50_000n)
  })

  test('chain hook (multiple phases, last wins)', async () => {
    const phases: string[] = []
    const chain = Chain.from({
      id: 1,
      name: 'Ethereum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
      prepareTransactionRequest: [
        (request, { phase }) => {
          phases.push(phase)
          return {
            ...request,
            data: phase === 'beforeFillParameters' ? '0xdead' : '0xbeef',
          }
        },
        { runAt: ['beforeFillParameters', 'afterFillParameters'] },
      ],
    })
    const hookClient = Client.create({
      chain,
      transport: http(anvil.mainnet.rpcUrl.http),
    })

    const { request } = await Actions.transaction.prepare(hookClient, {
      account,
      to,
      value: 1n,
    })
    expect((request as Record<string, unknown>).data).toBe('0xbeef')
    expect(phases).toEqual(['beforeFillParameters', 'afterFillParameters'])
  })

  test('afterFillParameters can access filled parameters', async () => {
    let capturedGas: bigint | undefined
    const chain = Chain.from({
      id: 1,
      name: 'Ethereum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
      prepareTransactionRequest: [
        (request, { phase }) => {
          if (phase === 'afterFillParameters')
            capturedGas = request.gas as bigint
          return request
        },
        { runAt: ['afterFillParameters'] },
      ],
    })
    const hookClient = Client.create({
      chain,
      transport: http(anvil.mainnet.rpcUrl.http),
    })

    const { request } = await Actions.transaction.prepare(hookClient, {
      account,
      to,
      value: 1n,
    })
    expect(capturedGas).toBeDefined()
    expect(capturedGas).toBe((request as Record<string, unknown>).gas)
  })
})

describe('behavior: fees', () => {
  test('chain fees.maxPriorityFeePerGas (bigint)', async () => {
    const chain = anvil.mainnet
    const { request } = await Actions.transaction.prepare(fallbackClient, {
      account,
      chain: Chain.from({
        id: 1,
        name: 'Ethereum',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: [chain.rpcUrl.http] } },
        fees: { maxPriorityFeePerGas: Value.fromGwei('69') },
      }),
      to,
      value: 1n,
    })
    expect(request.maxPriorityFeePerGas).toBe(Value.fromGwei('69'))
  })

  test('chain fees.maxPriorityFeePerGas (async)', async () => {
    const chain = anvil.mainnet
    const { request } = await Actions.transaction.prepare(fallbackClient, {
      account,
      chain: Chain.from({
        id: 1,
        name: 'Ethereum',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: [chain.rpcUrl.http] } },
        fees: { maxPriorityFeePerGas: async () => Value.fromGwei('69') },
      }),
      to,
      value: 1n,
    })
    expect(request.maxPriorityFeePerGas).toBe(Value.fromGwei('69'))
  })

  test('chain fees.maxPriorityFeePerGas (zero)', async () => {
    const chain = anvil.mainnet
    const { request } = await Actions.transaction.prepare(fallbackClient, {
      account,
      chain: Chain.from({
        id: 1,
        name: 'Ethereum',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: [chain.rpcUrl.http] } },
        fees: { maxPriorityFeePerGas: 0n },
      }),
      to,
      value: 1n,
    })
    expect(request.maxPriorityFeePerGas).toBe(0n)
  })

  test('legacy fees on non-1559 network', async () => {
    // Proxy that strips `baseFeePerGas` from blocks (forcing legacy detection)
    // and rejects `eth_fillTransaction` (forcing the manual path).
    const legacyServer = await Http.createServer(async (req, res) => {
      const body = await readBody(req)
      const payload = JSON.parse(body)
      res.setHeader('Content-Type', 'application/json')
      if (payload.method === 'eth_fillTransaction') {
        res.end(
          JSON.stringify({
            id: payload.id,
            jsonrpc: '2.0',
            error: { code: -32601, message: 'method not found' },
          }),
        )
        return
      }
      const response = await fetch(anvil.mainnet.rpcUrl.http, {
        body,
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const json = (await response.json()) as Record<string, any>
      if (
        payload.method.startsWith('eth_getBlock') &&
        json.result &&
        typeof json.result === 'object'
      )
        json.result.baseFeePerGas = undefined
      res.end(JSON.stringify(json))
    })
    try {
      const legacyClient = Client.create({ transport: http(legacyServer.url) })
      const { request } = await Actions.transaction.prepare(legacyClient, {
        account,
        to,
        value: 1n,
      })
      expect(request.type).toBe('legacy')
      expect(request.gasPrice).toBeTypeOf('bigint')
      expect(request.maxFeePerGas).toBeUndefined()
    } finally {
      await legacyServer.close()
    }
  })
})

describe('behavior: nonceManager', () => {
  test('nonceManager', async () => {
    const nonceManager = NonceManager.from({ source: NonceManager.jsonRpc() })

    const first = await Actions.transaction.prepare(client, {
      account,
      nonceManager,
      parameters: ['nonce'],
      to,
      value: 1n,
    })
    const second = await Actions.transaction.prepare(client, {
      account,
      nonceManager,
      parameters: ['nonce'],
      to,
      value: 1n,
    })

    expect(first.request.nonce).toBeTypeOf('number')
    expect(second.request.nonce).toBe((first.request.nonce as number) + 1)
  })

  test('nonceManager (concurrent)', async () => {
    const nonceManager = NonceManager.from({ source: NonceManager.jsonRpc() })
    const options = {
      account,
      nonceManager,
      parameters: ['nonce'],
      to,
      value: 1n,
    } as const

    const first = await Actions.transaction.prepare(client, options)
    const base = first.request.nonce as number

    const [a, b, c] = await Promise.all([
      Actions.transaction.prepare(client, options),
      Actions.transaction.prepare(client, options),
      Actions.transaction.prepare(client, options),
    ])

    const nonces = [a, b, c]
      .map((r) => r.request.nonce as number)
      .sort((x, y) => x - y)
    expect(nonces).toEqual([base + 1, base + 2, base + 3])
  })
})

describe('behavior: misc', () => {
  test('account hoisting', async () => {
    const hoisted = Client.create({
      account: Account.fromPrivateKey(constants.accounts[0].privateKey),
      transport: http(anvil.mainnet.rpcUrl.http),
    })

    const { request } = await Actions.transaction.prepare(hoisted, {
      to,
      value: 1n,
    })

    expect((request.from as string).toLowerCase()).toBe(account)
    expect((request.account as Account.Account).address.toLowerCase()).toBe(
      account,
    )
  })

  test('chainless client derives chainId via getChainId', async () => {
    const chainless = Client.create({
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const { request } = await Actions.transaction.prepare(chainless, {
      account,
      nonceManager: NonceManager.from({ source: NonceManager.jsonRpc() }),
      to,
      value: 1n,
    })
    expect(request.chainId).toBe(1)
  })
})

describe('errors', () => {
  test('MaxFeePerGasTooLowError', async () => {
    await expect(() =>
      Actions.transaction.prepare(fallbackClient, {
        account,
        maxFeePerGas: 1n,
        to,
        value: 1n,
      }),
    ).rejects.toThrowError(MaxFeePerGasTooLowError)
  })

  test('Eip1559FeesNotSupportedError', async () => {
    await expect(() =>
      Actions.transaction.prepare(fallbackClient, {
        account,
        maxFeePerGas: 10_000_000_000n,
        to,
        type: 'legacy',
        value: 1n,
      }),
    ).rejects.toThrowError(Eip1559FeesNotSupportedError)
  })

  test('aborted fill request is rethrown', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(() =>
      Actions.transaction.prepare(client, {
        account,
        requestOptions: { signal: controller.signal },
        to,
        value: 1n,
      }),
    ).rejects.toThrowError()
  })

  test('execution reverted during fill is rethrown', async () => {
    await expect(() =>
      Actions.transaction.prepare(client, {
        account,
        data: ownerOfNonexistent,
        to: erc721,
      }),
    ).rejects.toThrowError()
  })

  test('TipAboveFeeCapError (fill path)', async () => {
    await expect(() =>
      Actions.transaction.prepare(client, {
        account,
        maxFeePerGas: Value.fromGwei('0.1'),
        to,
        value: 1n,
      }),
    ).rejects.toThrowError(NodeError.TipAboveFeeCapError)
  })

  test('gasPrice + maxPriorityFeePerGas (legacy)', async () => {
    await expect(() =>
      Actions.transaction.prepare(fallbackClient, {
        account,
        gasPrice: Value.fromGwei('10'),
        maxPriorityFeePerGas: Value.fromGwei('20'),
        to,
        type: 'legacy',
        value: 1n,
      } as never),
    ).rejects.toThrowError(Eip1559FeesNotSupportedError)
  })
})
