import type { TransactionReceipt as TempoReceipt_ } from './chainConfig.js'
import type { Capabilities as TempoCapabilities_ } from 'viem/tempo'
import { http as tempoHttp_ } from 'viem/tempo'
import type { Address } from 'ox/Address'
import type { BaseError } from '../core/Errors.js'
import { Client as CoreClient_ } from 'viem'
import { from as parseUnits } from 'ox/Value'
import { fromNumber as toHex } from 'ox/Hex'
import { randomPrivateKey as generatePrivateKey } from 'ox/Secp256k1'
import { Actions as CoreActions_ } from 'viem'
import * as Transaction from 'ox/tempo/TxEnvelopeTempo'
import { tempoLocalnet as chain_ } from 'viem/chains'
import { Account as TempoAccount_ } from 'viem/tempo'
// Adapted from tempoxyz/api relay.test.ts at f209a9aca75123540fe5b959fd224b62494af399.

import { createRequestListener } from '@remix-run/node-fetch-server'
import { SignatureEnvelope, TxEnvelopeTempo } from 'ox/tempo'

import {
  Account,
  Actions,
  Addresses,
  type Capabilities,
  Relay,
  Store,
  Tick,
  VirtualAddress,
  withRelay,
} from 'viem/tempo'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'
import * as Tempo from '~test/tempo.js'
const nodeEnv = 'localnet'
import { createServer as createHttpServer } from '~test/http.js'

type Server = Awaited<ReturnType<typeof createHttpServer>>

const userAccount = TempoAccount_.fromSecp256k1(Tempo.accounts[9]!.privateKey)
const feePayerAccount = TempoAccount_.fromSecp256k1(
  Tempo.accounts[0]!.privateKey,
)
const recipient = TempoAccount_.fromSecp256k1(Tempo.accounts[7]!.privateKey)

/**
 * Tokens the relay handler probes for fee-token resolution. The default
 * `resolveTokens` uses the Tempo API for mainnet and testnet, so localnet
 * tests inject this list explicitly.
 */
const localnetTokens = [
  '0x20c0000000000000000000000000000000000000',
  '0x20c0000000000000000000000000000000000001',
  '0x20c0000000000000000000000000000000000002',
  '0x20c0000000000000000000000000000000000003',
] as const

/** Case-insensitive lookup into balanceDiffs keyed by address. */
function findDiffs(
  balanceDiffs: Capabilities.FillTransactionCapabilities['balanceDiffs'],
  address: string,
) {
  return Object.entries(balanceDiffs ?? {}).find(
    ([addr]) => addr.toLowerCase() === address.toLowerCase(),
  )?.[1]
}

/** Extracts relay virtual-address metadata while viem's public type catches up. */
function virtualAddresses(
  capabilities: Capabilities.FillTransactionCapabilities | undefined,
) {
  return (
    capabilities as
      | (Capabilities.FillTransactionCapabilities & {
          virtualAddresses?: Record<Address, Address | null> | undefined
        })
      | undefined
  )?.virtualAddresses
}

/** Client used only to build typed calldata (`Actions.token.*.call`). */
const caller = Tempo.getClient({})

beforeAll(async () => {
  // Faucet-fund the accounts that pay fees or create fresh tokens. The faucet is
  // permissionless, so no genesis privileges are required. Left unfunded on
  // purpose: accounts[10] (insufficient-balance tests) and accounts[7]
  // (recipient only).
  await Promise.all(
    [0, 2, 3, 4, 6, 8, 9].map((index) =>
      Actions.faucet.fundSync(Tempo.getClient({}), {
        account: TempoAccount_.fromSecp256k1(Tempo.accounts[index]!.privateKey),
        timeout: 60_000,
      }),
    ),
  )
  // userAccount prefers alphaUsd (a faucet-funded genesis token) as its fee token.
  await CoreActions_.transaction.waitForReceipt(caller, {
    hash: await Actions.fee.setUserToken(Tempo.getClient({}), {
      account: userAccount,
      token: Tempo.alphaUsd,
    }),
  })
})

describe.skipIf(nodeEnv !== 'localnet')('default', () => {
  let client: CoreClient_.Client<typeof chain_>
  let server: Server

  beforeAll(async () => {
    const relay = Relay.create({
      client: Tempo.getClient({
        batch: { multicall: { deployless: true } },
      }),
      plugins: [Relay.feePayer()],
    })

    server = await createHttpServer(createRequestListener(relay.fetch))
    client = Tempo.getClient({
      transport: tempoHttp_(server.url),
    })
  })

  afterAll(async () => {
    await server.close()
  })

  test('default: returns filled transaction with capabilities', async () => {
    const { transaction } = await CoreActions_.transaction.fill(client, {
      account: userAccount.address,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.alphaUsd,
          to: recipient.address,
          amount: 1n,
        }),
      ],
    })

    expect(transaction.gas).toBeDefined()
    expect(transaction.nonce).toBeDefined()
  })

  test('behavior: proxies other methods to RPC node', async () => {
    const chainId = await client.request({ method: 'eth_chainId' })
    expect(Number(chainId)).toMatchInlineSnapshot(`${chain_.id}`)
  })

  test('behavior: surfaces upstream RPC errors as JSON-RPC errors', async () => {
    // grantRoles reverts with Unauthorized when caller is not an admin
    // (eth_call defaults `from` to the zero address). We expect the relay to
    // forward the revert as a structured JSON-RPC error response (HTTP 200
    // with `error.code`/`error.data`), not a 500.
    const call = Actions.token.grantRoles.call(caller, {
      token: Tempo.alphaUsd,
      role: 'issuer',
      to: recipient.address,
    })

    const response = await fetch(server.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{ to: call.to, data: call.data }, 'latest'],
      }),
    })

    expect(response.status).toBe(200)
    const body = (await response.json()) as {
      id: number
      jsonrpc: string
      error: { code: number; message: string; data?: string }
    }
    // Drop `message` from the snapshot — it embeds the upstream RPC URL/port
    // and viem version, which are nondeterministic.
    const { message: _message, ...errorRest } = body.error
    expect({ ...body, error: errorRest }).toMatchInlineSnapshot(`
      {
        "error": {
          "code": 3,
          "data": "0x82b42900",
        },
        "id": 1,
        "jsonrpc": "2.0",
      }
    `)
  })

  test('behavior: returns actionable error for eth_signRawTransaction without feePayer', async () => {
    const response = await fetch(server.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_signRawTransaction',
        params: ['0x00'],
      }),
    })

    expect(response.status).toBe(200)
    const body = (await response.json()) as {
      id: number
      jsonrpc: string
      error: { code: number; message: string }
    }
    expect(body.error.code).toBe(-32601)
    expect(body.error.message).toContain('fee payer')
    expect(body.error.message).toContain('Relay.feePayer({ account })')
  })

  test('behavior: handles JSON-RPC batch requests', async () => {
    const response = await fetch(server.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        { jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] },
        { jsonrpc: '2.0', id: 2, method: 'eth_chainId', params: [] },
      ]),
    })

    expect(response.status).toBe(200)
    const body = (await response.json()) as { id: number; result: string }[]
    expect(Array.isArray(body)).toBe(true)
    expect(body).toHaveLength(2)
    expect(body[0]!.id).toBe(1)
    expect(body[1]!.id).toBe(2)
    expect(Number(body[0]!.result)).toBe(chain_.id)
    expect(Number(body[1]!.result)).toBe(chain_.id)
  })
})

describe.skipIf(nodeEnv !== 'localnet')('behavior: with feePayer', () => {
  let server: Server
  let client: CoreClient_.Client<typeof chain_>
  let requests: Relay.handleRequest.Request[] = []

  beforeAll(async () => {
    const relay = Relay.create({
      client: Tempo.getClient({
        batch: { multicall: { deployless: true } },
      }),
      plugins: [
        {
          async handleRequest(context, next) {
            const { request } = context
            requests.push(request)
            return next()
          },
        },
        Relay.feePayer({
          account: feePayerAccount,
          name: 'Test Sponsor',
          url: 'https://test.com',
        }),
      ],
    })

    server = await createHttpServer(createRequestListener(relay.fetch))
    client = Tempo.getClient({
      transport: tempoHttp_(server.url),
    })
  })

  afterAll(async () => {
    await server.close()
  })

  afterEach(() => {
    requests = []
  })

  test('default: returns sponsored tx with feePayerSignature', async () => {
    const { transaction } = await CoreActions_.transaction.fill(client, {
      account: userAccount.address,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.alphaUsd,
          to: recipient.address,
          amount: 1n,
        }),
      ],
    })

    expect(transaction.feePayerSignature).toBeDefined()
    expect(requests.map(({ method }) => method)).toMatchInlineSnapshot(`
      [
        "eth_fillTransaction",
      ]
    `)
  })

  test('behavior: returns sponsor capabilities', async () => {
    const result = await CoreActions_.transaction.fill(client, {
      account: userAccount.address,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.alphaUsd,
          to: recipient.address,
          amount: 1n,
        }),
      ],
    })
    const meta = result.capabilities as
      | TempoCapabilities_.FillTransactionCapabilities
      | undefined

    expect(meta?.sponsored).toBe(true)
    expect(meta?.sponsor).toMatchInlineSnapshot(`
      {
        "address": "${feePayerAccount.address}",
        "name": "Test Sponsor",
        "url": "https://test.com",
      }
    `)
  })

  test('behavior: sponsored tx can be signed and broadcast', async () => {
    const { transaction } = await CoreActions_.transaction.fill(client, {
      account: userAccount.address,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.alphaUsd,
          to: recipient.address,
          amount: 1n,
        }),
      ],
    })
    const signed = await userAccount.signTransaction(transaction as never)
    const receipt = (await Tempo.getClient({}).request({
      method: 'eth_sendRawTransactionSync',
      params: [signed],
    })) as { feePayer?: string | undefined }

    expect((receipt as TempoReceipt_).feePayer).toBe(
      feePayerAccount.address.toLowerCase(),
    )
  })

  test('behavior: missing from remains an RPC error when errors capability is enabled', async () => {
    const anonymous = CoreClient_.create({
      chain: chain_,
      transport: tempoHttp_(server.url),
    })

    await expect(
      CoreActions_.transaction.fill(anonymous, {
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
        capabilities: { errors: true },
      }),
    ).rejects.toMatchObject({
      cause: { code: -32602, message: 'unknown account' },
    })
  })
})

describe.runIf(
  nodeEnv === 'localnet' &&
    process.env.VITE_TEMPO_MULTISIG === 'true' &&
    process.env.VITE_TEMPO_TAG === 'sha-83f3ccd',
)('multisig', () => {
  let client: CoreClient_.Client<typeof chain_>
  let server: Server
  const store = Store.memory()

  beforeAll(async () => {
    const relay = Relay.create({
      resolveTokens: () => localnetTokens,

      client: Tempo.getClient({
        batch: { multicall: { deployless: true } },
      }),
      plugins: [Relay.multisig({ store }), Relay.feePayer(), Relay.feeToken()],
    })

    server = await createHttpServer(createRequestListener(relay.fetch))
    client = CoreClient_.create({
      chain: chain_,
      pollingInterval: 100,
      transport: withRelay(tempoHttp_(Tempo.rpcUrl), tempoHttp_(server.url)),
    })
  })

  afterAll(async () => {
    await server.close()
  })

  test('example: initial configuration', async () => {
    const owner_1 = TempoAccount_.fromSecp256k1(Tempo.accounts[1]!.privateKey)
    const owner_2 = TempoAccount_.fromSecp256k1(Tempo.accounts[2]!.privateKey)
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1.address, owner_2.address],
      salt: toHex(0x109700, { size: 32 }),
      threshold: 2,
    })

    await Actions.token.transferSync(caller, {
      account: feePayerAccount,
      amount: parseUnits('1', 6),
      to: account.address,
      token: Tempo.alphaUsd,
    })
    const balance = await Actions.token.getBalance(client, {
      account: recipient.address,
      token: Tempo.alphaUsd,
    })

    const { receipt: pending } = await Actions.token.transferSync(client, {
      account,
      amount: 1n,
      owner: owner_1,
      to: recipient.address,
      token: Tempo.alphaUsd,
    })
    expect({
      signatureCount: (pending as TempoReceipt_).multisig?.signatureCount,
      status: pending.status,
      threshold: (pending as TempoReceipt_).multisig?.threshold,
      weight: (pending as TempoReceipt_).multisig?.weight,
    }).toMatchInlineSnapshot(`
      {
        "signatureCount": 1,
        "status": "pending",
        "threshold": 2,
        "weight": 1,
      }
    `)

    const { receipt } = await Actions.token.transferSync(client, {
      account,
      amount: 1n,
      hash: pending.transactionHash,
      owner: owner_2,
      to: recipient.address,
      token: Tempo.alphaUsd,
    } as never)
    expect({
      signatureCount: (receipt as TempoReceipt_).multisig?.signatureCount,
      status: receipt.status,
      threshold: (receipt as TempoReceipt_).multisig?.threshold,
      weight: (receipt as TempoReceipt_).multisig?.weight,
    }).toMatchInlineSnapshot(`
      {
        "signatureCount": 2,
        "status": "success",
        "threshold": 2,
        "weight": 2,
      }
    `)
    expect(
      (
        await Actions.token.getBalance(client, {
          account: recipient.address,
          token: Tempo.alphaUsd,
        })
      ).amount - balance.amount,
    ).toMatchInlineSnapshot(`1n`)

    const transaction = await CoreActions_.transaction.get(client, {
      hash: receipt.transactionHash,
    })
    if (transaction.signature?.type !== 'multisig')
      throw new Error('Expected a multisig signature.')
    expect({
      account: transaction.signature.account,
      signatureCount: transaction.signature.signatures.length,
      type: transaction.signature.type,
      version: transaction.signature.config.version,
    }).toMatchInlineSnapshot(`
      {
        "account": "${account.address.toLowerCase()}",
        "signatureCount": 2,
        "type": "multisig",
        "version": 0n,
      }
    `)
  })

  test('rejects multisig accounts as owners', () => {
    const child = Account.fromMultisig({
      owners: [TempoAccount_.fromSecp256k1(Tempo.accounts[3]!.privateKey)],
    })
    expect(() => Account.fromMultisig({ owners: [child as never] })).toThrow()
  })

  test('example: weighted quorum', async () => {
    const owners = [
      TempoAccount_.fromSecp256k1(Tempo.accounts[4]!.privateKey),
      TempoAccount_.fromSecp256k1(Tempo.accounts[6]!.privateKey),
      TempoAccount_.fromSecp256k1(Tempo.accounts[8]!.privateKey),
    ].sort((a, b) => a.address.localeCompare(b.address))
    const heavy = owners[0]!
    const light_1 = owners[1]!
    const light_2 = owners[2]!
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [
        { owner: heavy.address, weight: 2 },
        { owner: light_1.address, weight: 1 },
        { owner: light_2.address, weight: 1 },
      ],
      salt: toHex(0x109703, { size: 32 }),
      threshold: 3,
    })

    await Actions.token.transferSync(caller, {
      account: feePayerAccount,
      amount: parseUnits('1', 6),
      to: account.address,
      token: Tempo.alphaUsd,
    })

    const { receipt: alicePending } = await Actions.token.transferSync(client, {
      account,
      amount: 3n,
      owner: heavy,
      to: recipient.address,
      token: Tempo.alphaUsd,
    })
    expect({
      status: alicePending.status,
      weight: (alicePending as TempoReceipt_).multisig?.weight,
    }).toMatchInlineSnapshot(`
      {
        "status": "pending",
        "weight": 2,
      }
    `)
    const { receipt: aliceBob } = await Actions.token.transferSync(client, {
      account,
      amount: 3n,
      hash: alicePending.transactionHash,
      owner: light_1,
      to: recipient.address,
      token: Tempo.alphaUsd,
    } as never)
    expect(aliceBob.status).toMatchInlineSnapshot(`"success"`)

    const { receipt: secondAlicePending } = await Actions.token.transferSync(
      client,
      {
        account,
        amount: 4n,
        owner: heavy,
        to: recipient.address,
        token: Tempo.alphaUsd,
      },
    )
    const { receipt: aliceCarol } = await Actions.token.transferSync(client, {
      account,
      amount: 4n,
      hash: secondAlicePending.transactionHash,
      owner: light_2,
      to: recipient.address,
      token: Tempo.alphaUsd,
    } as never)
    expect(aliceCarol.status).toMatchInlineSnapshot(`"success"`)

    const { receipt: bobPending } = await Actions.token.transferSync(client, {
      account,
      amount: 5n,
      owner: light_1,
      to: recipient.address,
      token: Tempo.alphaUsd,
    })
    const { receipt: bobCarolPending } = await Actions.token.transferSync(
      client,
      {
        account,
        amount: 5n,
        hash: bobPending.transactionHash,
        owner: light_2,
        to: recipient.address,
        token: Tempo.alphaUsd,
      } as never,
    )
    expect({
      status: bobCarolPending.status,
      weight: (bobCarolPending as TempoReceipt_).multisig?.weight,
    }).toMatchInlineSnapshot(`
      {
        "status": "pending",
        "weight": 2,
      }
    `)

    const { receipt } = await Actions.token.transferSync(client, {
      account,
      amount: 5n,
      hash: bobCarolPending.transactionHash,
      owner: heavy,
      to: recipient.address,
      token: Tempo.alphaUsd,
    } as never)
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)

    const transaction = await CoreActions_.transaction.get(client, {
      hash: receipt.transactionHash,
    })
    if (transaction.signature?.type !== 'multisig')
      throw new Error('Expected a multisig signature.')
    expect({
      signatureCount: transaction.signature.signatures.length,
      status: receipt.status,
      weight: (receipt as TempoReceipt_).multisig?.weight,
    }).toMatchInlineSnapshot(`
      {
        "signatureCount": 2,
        "status": "success",
        "weight": 3,
      }
    `)
  })

  test('example: fee sponsorship', async () => {
    const sponsorStore = Store.memory()
    const sponsorRelay = Relay.create({
      resolveTokens: () => localnetTokens,

      client: Tempo.getClient({
        batch: { multicall: { deployless: true } },
      }),
      plugins: [
        Relay.multisig({ store: sponsorStore }),
        Relay.feePayer({
          account: feePayerAccount,
          onSponsored: () => ({ subsidized: true }),
        }),
        Relay.feeToken(),
      ],
    })

    const sponsorServer = await createHttpServer(
      createRequestListener(sponsorRelay.fetch),
    )
    const sponsorClient = CoreClient_.create({
      chain: chain_,
      pollingInterval: 100,
      transport: withRelay(
        tempoHttp_(Tempo.rpcUrl),
        tempoHttp_(sponsorServer.url),
      ),
    })
    const owner_1 = TempoAccount_.fromSecp256k1(Tempo.accounts[1]!.privateKey)
    const owner_2 = TempoAccount_.fromSecp256k1(Tempo.accounts[2]!.privateKey)

    try {
      const { request: transaction } = await CoreActions_.transaction.prepare(
        caller,
        {
          account: userAccount.address,
          calls: [
            Actions.token.transfer.call(caller, {
              token: Tempo.alphaUsd,
              to: recipient.address,
              amount: 1n,
            }),
          ],
          feePayer: true,
        },
      )
      const serialized = await userAccount.signTransaction(transaction as never)
      const response = await fetch(sponsorServer.url, {
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'eth_sendRawTransactionSync',
          params: [serialized],
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      expect(await response.json()).toMatchObject({
        sponsorship_details: { subsidized: true },
      })

      const ownerFirst = Account.fromMultisig({
        address: 'infer',
        owners: [owner_1.address, owner_2.address],
        salt: toHex(0x109704, { size: 32 }),
        threshold: 2,
      })
      await Actions.token.transferSync(caller, {
        account: feePayerAccount,
        amount: parseUnits('1', 6),
        to: ownerFirst.address,
        token: Tempo.alphaUsd,
      })

      const { receipt: ownerFirstPending } = await Actions.token.transferSync(
        sponsorClient,
        {
          account: ownerFirst,
          amount: 6n,
          feePayer: true,
          owner: owner_1,
          to: recipient.address,
          token: Tempo.alphaUsd,
        },
      )
      const ownerFirstPendingOperation = (ownerFirstPending as TempoReceipt_)
        .multisig
      if (!ownerFirstPendingOperation)
        throw new Error('Expected a multisig operation.')
      const ownerFirstTransaction = Transaction.deserialize(
        ownerFirstPendingOperation.transaction as Transaction.Serialized,
      )
      expect({
        feePayerSigned:
          'feePayerSignature' in ownerFirstTransaction &&
          !!ownerFirstTransaction.feePayerSignature,
        status: ownerFirstPending.status,
      }).toMatchInlineSnapshot(`
        {
          "feePayerSigned": false,
          "status": "pending",
        }
      `)

      const { receipt: ownerFirstReceipt } = await Actions.token.transferSync(
        sponsorClient,
        {
          account: ownerFirst,
          amount: 6n,
          hash: ownerFirstPending.transactionHash,
          owner: owner_2,
          to: recipient.address,
          token: Tempo.alphaUsd,
        } as never,
      )
      expect({
        feePayer: (ownerFirstReceipt as TempoReceipt_).feePayer,
        status: ownerFirstReceipt.status,
      }).toMatchInlineSnapshot(`
        {
          "feePayer": "${feePayerAccount.address.toLowerCase()}",
          "status": "success",
        }
      `)

      const feePayerFirst = Account.fromMultisig({
        address: 'infer',
        owners: [owner_1.address, owner_2.address],
        salt: toHex(0x109705, { size: 32 }),
        threshold: 2,
      })
      await Actions.token.transferSync(caller, {
        account: feePayerAccount,
        amount: parseUnits('1', 6),
        to: feePayerFirst.address,
        token: Tempo.alphaUsd,
      })

      const { receipt: feePayerFirstPending } =
        await Actions.token.transferSync(sponsorClient, {
          account: feePayerFirst,
          amount: 7n,
          feePayer: feePayerAccount,
          maxPriorityFeePerGas: 0n,
          owner: owner_1,
          to: recipient.address,
          token: Tempo.alphaUsd,
        })
      const feePayerFirstPendingOperation = (
        feePayerFirstPending as TempoReceipt_
      ).multisig
      if (!feePayerFirstPendingOperation)
        throw new Error('Expected a multisig operation.')
      const feePayerFirstTransaction = Transaction.deserialize(
        feePayerFirstPendingOperation.transaction as Transaction.Serialized,
      )
      if (!('feePayerSignature' in feePayerFirstTransaction))
        throw new Error('Expected a Tempo transaction.')
      expect({
        feePayerSigned:
          'feePayerSignature' in feePayerFirstTransaction &&
          !!feePayerFirstTransaction.feePayerSignature,
        status: feePayerFirstPending.status,
      }).toMatchInlineSnapshot(`
        {
          "feePayerSigned": true,
          "status": "pending",
        }
      `)

      const { request: approval } = await CoreActions_.transaction.prepare(
        sponsorClient,
        {
          account: feePayerFirst,
          hash: feePayerFirstPending.transactionHash,
          owner: owner_2,
        },
      )
      expect(approval.maxPriorityFeePerGas).toBe(0n)
      expect(approval.gas).toBe(feePayerFirstTransaction.gas)
      expect(approval).toMatchObject({
        feePayerSignature: feePayerFirstTransaction.feePayerSignature,
      })

      const { receipt: feePayerFirstReceipt } =
        await Actions.token.transferSync(sponsorClient, {
          account: feePayerFirst,
          amount: 7n,
          hash: feePayerFirstPending.transactionHash,
          owner: owner_2,
          to: recipient.address,
          token: Tempo.alphaUsd,
        } as never)
      expect({
        feePayer: (feePayerFirstReceipt as TempoReceipt_).feePayer,
        status: feePayerFirstReceipt.status,
      }).toMatchInlineSnapshot(`
        {
          "feePayer": "${feePayerAccount.address.toLowerCase()}",
          "status": "success",
        }
      `)
    } finally {
      await sponsorServer.close()
    }
  })

  test('example: initial config and immediate access key use', async () => {
    const owner_1 = TempoAccount_.fromSecp256k1(Tempo.accounts[3]!.privateKey)
    const owner_2 = TempoAccount_.fromSecp256k1(Tempo.accounts[4]!.privateKey)
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2],
      salt: toHex(0x109706, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })

    await Actions.token.transferSync(caller, {
      account: feePayerAccount,
      amount: parseUnits('1', 6),
      to: account.address,
      token: Tempo.alphaUsd,
    })
    const pending = await Actions.accessKey.signAuthorization(client, {
      accessKey,
      account,
      owner: owner_1,
    })
    expect({
      signatureCount: pending.multisig.signatureCount,
      status: pending.status,
      threshold: pending.multisig.threshold,
      weight: pending.multisig.weight,
    }).toMatchInlineSnapshot(`
      {
        "signatureCount": 1,
        "status": "pending",
        "threshold": 2,
        "weight": 1,
      }
    `)
    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      hash: pending.hash,
      owner: owner_2,
    })

    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: 8n,
      keyAuthorization,
      to: recipient.address,
      token: Tempo.alphaUsd,
    })
    const transaction = await CoreActions_.transaction.get(client, {
      hash: receipt.transactionHash,
    })
    expect({
      from: receipt.from,
      keyAuthorizationSignature: transaction.keyAuthorization?.signature.type,
      status: receipt.status,
      transactionSignature: transaction.signature?.type,
      version:
        transaction.keyAuthorization?.signature.type === 'multisig'
          ? transaction.keyAuthorization.signature.config.version
          : undefined,
    }).toMatchInlineSnapshot(`
      {
        "from": "${account.address.toLowerCase()}",
        "keyAuthorizationSignature": "multisig",
        "status": "success",
        "transactionSignature": "keychain",
        "version": 0n,
      }
    `)
  })

  test('example: initial config and subsequent access key use', async () => {
    const owner_1 = TempoAccount_.fromSecp256k1(Tempo.accounts[6]!.privateKey)
    const owner_2 = TempoAccount_.fromSecp256k1(Tempo.accounts[8]!.privateKey)
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2],
      salt: toHex(0x109707, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })

    await Actions.token.transferSync(caller, {
      account: feePayerAccount,
      amount: parseUnits('1', 6),
      to: account.address,
      token: Tempo.alphaUsd,
    })
    const pendingAuthorization = await Actions.accessKey.signAuthorization(
      client,
      {
        accessKey,
        account,
        owner: owner_1,
      },
    )
    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      hash: pendingAuthorization.hash,
      owner: owner_2,
    })

    const { receipt: pending } = await Actions.token.transferSync(client, {
      account,
      amount: 9n,
      keyAuthorization,
      owner: owner_1,
      to: recipient.address,
      token: Tempo.alphaUsd,
    })
    const { receipt: initialReceipt } = await Actions.token.transferSync(
      client,
      {
        account,
        amount: 9n,
        hash: pending.transactionHash,
        keyAuthorization,
        owner: owner_2,
        to: recipient.address,
        token: Tempo.alphaUsd,
      } as never,
    )
    const initialTransaction = await CoreActions_.transaction.get(client, {
      hash: initialReceipt.transactionHash,
    })
    expect({
      keyAuthorizationSignature:
        initialTransaction.keyAuthorization?.signature.type,
      status: initialReceipt.status,
      transactionSignature: initialTransaction.signature?.type,
    }).toMatchInlineSnapshot(`
      {
        "keyAuthorizationSignature": "multisig",
        "status": "success",
        "transactionSignature": "multisig",
      }
    `)

    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: 10n,
      to: recipient.address,
      token: Tempo.alphaUsd,
    })
    expect({
      from: receipt.from,
      status: receipt.status,
    }).toMatchInlineSnapshot(`
      {
        "from": "${account.address.toLowerCase()}",
        "status": "success",
      }
    `)
  })

  test('example: current configuration and configuration rotation', async () => {
    const owner_1 = TempoAccount_.fromSecp256k1(Tempo.accounts[1]!.privateKey)
    const owner_2 = TempoAccount_.fromSecp256k1(Tempo.accounts[2]!.privateKey)
    const owner_3 = TempoAccount_.fromSecp256k1(Tempo.accounts[3]!.privateKey)
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2],
      salt: toHex(0x109708, { size: 32 }),
      threshold: 2,
    })
    const nextConfig = {
      owners: [{ owner: owner_3.address, weight: 1 }],
      threshold: 1,
    } as const

    await Actions.token.transferSync(caller, {
      account: feePayerAccount,
      amount: parseUnits('1', 6),
      to: account.address,
      token: Tempo.alphaUsd,
    })
    const { receipt: pending } = await Actions.multisig.updateConfigSync(
      client,
      {
        account,
        nextConfig,
        owner: owner_1,
      },
    )
    expect({
      status: pending.status,
      version: (pending as TempoReceipt_).multisig?.config.version,
    }).toMatchInlineSnapshot(`
      {
        "status": "pending",
        "version": 0n,
      }
    `)

    const { receipt: updateReceipt, ...rotation } =
      await Actions.multisig.updateConfigSync(client, {
        account,
        hash: pending.transactionHash,
        nextConfig,
        owner: owner_2,
      } as never)
    expect({
      account: rotation.account,
      status: updateReceipt.status,
      threshold: rotation.config.threshold,
      version: rotation.config.version,
    }).toMatchInlineSnapshot(`
      {
        "account": "${account.address}",
        "status": "success",
        "threshold": 1,
        "version": 1n,
      }
    `)

    const currentAccount = Account.fromMultisig(account.address)
    const { receipt } = await Actions.token.transferSync(client, {
      account: currentAccount,
      amount: 11n,
      owner: owner_3,
      to: recipient.address,
      token: Tempo.alphaUsd,
    })
    const transaction = await CoreActions_.transaction.get(client, {
      hash: receipt.transactionHash,
    })
    expect({
      account: transaction.from,
      status: receipt.status,
      version:
        transaction.signature?.type === 'multisig'
          ? transaction.signature.config.version
          : undefined,
    }).toMatchInlineSnapshot(`
      {
        "account": "${account.address.toLowerCase()}",
        "status": "success",
        "version": 1n,
      }
    `)
  })

  test('behavior: routes pathless approvals to their operation chain', async () => {
    const owner_1 = TempoAccount_.fromSecp256k1(Tempo.accounts[1]!.privateKey)
    const owner_2 = TempoAccount_.fromSecp256k1(Tempo.accounts[2]!.privateKey)
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2],
      salt: toHex(0x109709, { size: 32 }),
      threshold: 2,
    })

    await Actions.token.transferSync(caller, {
      account: feePayerAccount,
      amount: parseUnits('1', 6),
      to: account.address,
      token: Tempo.alphaUsd,
    })
    const { receipt: pending } = await Actions.token.transferSync(client, {
      account,
      amount: 12n,
      owner: owner_1,
      to: recipient.address,
      token: Tempo.alphaUsd,
    })

    const routedRelay = Relay.create({
      resolveTokens: () => localnetTokens,

      getClient({ chainId }) {
        if (chainId !== chain_.id)
          throw new Error('Expected the multisig operation chain.')
        return Tempo.getClient({
          batch: { multicall: { deployless: true } },
        })
      },
      plugins: [Relay.multisig({ store }), Relay.feePayer(), Relay.feeToken()],
    })

    const routedServer = await createHttpServer(
      createRequestListener(routedRelay.fetch),
    )
    try {
      const routedClient = CoreClient_.create({
        chain: chain_,
        pollingInterval: 100,
        transport: withRelay(
          tempoHttp_(Tempo.rpcUrl),
          tempoHttp_(routedServer.url),
        ),
      })
      const { receipt } = await Actions.token.transferSync(routedClient, {
        account,
        amount: 12n,
        hash: pending.transactionHash,
        owner: owner_2,
        to: recipient.address,
        token: Tempo.alphaUsd,
      } as never)

      expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    } finally {
      await routedServer.close()
    }
  })
})

describe.skipIf(nodeEnv !== 'localnet')(
  'behavior: with feePayer.feeToken',
  () => {
    let server: Server
    let client: CoreClient_.Client<typeof chain_>

    const sponsorFeeToken =
      '0x20c0000000000000000000000000000000000000' as const // pathUSD

    beforeAll(async () => {
      const relay = Relay.create({
        resolveTokens: () => localnetTokens,

        client: Tempo.getClient({
          batch: { multicall: { deployless: true } },
        }),
        plugins: [
          Relay.feePayer({
            account: feePayerAccount,
            feeToken: sponsorFeeToken,
          }),
          Relay.feeToken(),
        ],
      })

      server = await createHttpServer(createRequestListener(relay.fetch))
      client = Tempo.getClient({
        transport: tempoHttp_(server.url),
      })
    })

    afterAll(async () => {
      await server.close()
    })

    test('default: sponsor.feeToken is used when request omits feeToken', async () => {
      const { transaction } = await CoreActions_.transaction.fill(client, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
      })
      expect(transaction.feeToken?.toLowerCase()).toBe(sponsorFeeToken)
      expect(transaction.feePayerSignature).toBeDefined()
    })

    test('behavior: sponsor.feeToken overrides request feeToken on sponsored fills', async () => {
      const { transaction } = await CoreActions_.transaction.fill(client, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
        feeToken: Tempo.alphaUsd as Address,
      })
      expect(transaction.feeToken?.toLowerCase()).toBe(sponsorFeeToken)
      expect(transaction.feePayerSignature).toBeDefined()
    })

    test('behavior: request feeToken wins when sponsorship is opted out via feePayer:false', async () => {
      const { transaction } = await CoreActions_.transaction.fill(client, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
        feePayer: false as never,
        feeToken: Tempo.alphaUsd as Address,
      })
      expect(transaction.feeToken?.toLowerCase()).toBe(
        Tempo.alphaUsd.toLowerCase(),
      )
      expect(transaction.feePayerSignature).toBeUndefined()
    })

    test('behavior: broadcast tx receipt records the sponsor.feeToken', async () => {
      // Fill via relay (where override kicks in), then sign + broadcast manually.
      // viem's `sendTransactionSync` with a hydrated account does local prep and
      // would skip the relay's `eth_fillTransaction`, bypassing the override.
      const { transaction } = await CoreActions_.transaction.fill(client, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
        feeToken: Tempo.alphaUsd as Address,
      })
      expect(transaction.feeToken?.toLowerCase()).toBe(sponsorFeeToken)

      const signed = await userAccount.signTransaction(transaction as never)
      const receipt = (await Tempo.getClient({}).request({
        method: 'eth_sendRawTransactionSync',
        params: [signed],
      })) as { feePayer?: string | undefined; feeToken?: string | undefined }

      expect((receipt as TempoReceipt_).feePayer).toBe(
        feePayerAccount.address.toLowerCase(),
      )
      expect(receipt.feeToken?.toLowerCase()).toBe(sponsorFeeToken)
    })

    test('behavior: raw sponsor signing restores sponsor.feeToken when envelope omits feeToken', async () => {
      const rpc = Tempo.getClient({ account: userAccount })
      const { transaction } = await CoreActions_.transaction.fill(rpc, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
        feePayer: true as never,
      })
      const partial = await userAccount.signTransaction({
        ...transaction,
        feePayer: true,
      } as never)
      expect([null, undefined]).toContain(
        Transaction.deserialize(partial as `0x76${string}`).feeToken,
      )

      const response = await fetch(server.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_signRawTransaction',
          params: [partial],
        }),
      })
      const body = (await response.json()) as { result: `0x76${string}` }
      const feeToken = Transaction.deserialize(body.result).feeToken as
        | Address
        | undefined

      expect(feeToken?.toLowerCase()).toBe(sponsorFeeToken)
    })

    test('behavior: raw sponsor signing restores token-list default before validation', async () => {
      let feeToken_validated: Address | undefined
      const customRelay = Relay.create({
        resolveTokens: () => localnetTokens,

        client: Tempo.getClient({
          batch: { multicall: { deployless: true } },
        }),
        plugins: [
          Relay.feePayer({
            account: feePayerAccount,
            validate: (request) => {
              feeToken_validated = request.feeToken as Address | undefined
              return true
            },
          }),
          Relay.feeToken(),
        ],
      })

      const customServer = await createHttpServer(
        createRequestListener(customRelay.fetch),
      )
      const rpc = Tempo.getClient({ account: userAccount })
      const { transaction } = await CoreActions_.transaction.fill(rpc, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
        feePayer: true as never,
      })
      const partial = await userAccount.signTransaction({
        ...transaction,
        feePayer: true,
      } as never)

      try {
        const response = await fetch(customServer.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_signRawTransaction',
            params: [partial],
          }),
        })
        const body = (await response.json()) as { result: `0x76${string}` }
        const feeToken = Transaction.deserialize(body.result).feeToken as
          | Address
          | undefined

        expect(feeToken_validated?.toLowerCase()).toBe(sponsorFeeToken)
        expect(feeToken?.toLowerCase()).toBe(sponsorFeeToken)
      } finally {
        await customServer.close()
      }
    })
  },
)

describe.skipIf(nodeEnv !== 'localnet')(
  'behavior: with app-provided feePayer URL',
  () => {
    let appServer: Server
    let walletServer: Server
    let client: CoreClient_.Client<typeof chain_>

    beforeAll(async () => {
      // App relay: has a fee payer account and signs transactions.
      const appRelay = Relay.create({
        client: Tempo.getClient({
          batch: { multicall: { deployless: true } },
        }),
        plugins: [
          Relay.feePayer({
            account: feePayerAccount,
            name: 'App Sponsor',
            url: 'https://app.example.com',
          }),
        ],
      })

      appServer = await createHttpServer(createRequestListener(appRelay.fetch))

      // Wallet relay: no fee payer configured — proxies to app relay.
      const walletRelay = Relay.create({
        client: Tempo.getClient({
          batch: { multicall: { deployless: true } },
        }),
        plugins: [
          Relay.feePayer({
            allowedFeePayers: [appServer.url],
            internal_allowUnsafeUrls: true,
          }),
        ],
      })

      walletServer = await createHttpServer(
        createRequestListener(walletRelay.fetch),
      )

      client = Tempo.getClient({
        transport: tempoHttp_(walletServer.url),
      })
    })

    afterAll(async () => {
      await appServer.close()
      await walletServer.close()
    })

    test('default: proxies fill to app relay and returns sponsored tx', async () => {
      const { transaction } = await CoreActions_.transaction.fill(client, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
        feePayer: appServer.url as never,
      })

      expect(transaction.feePayerSignature).toBeDefined()
      expect(transaction.gas).toBeDefined()
    })

    test('rejects redirects from external fee-payer relays', async () => {
      let targetRequests = 0
      const target = await createHttpServer((_request, response) => {
        targetRequests++
        response.end()
      })
      const redirect = await createHttpServer((_request, response) => {
        response.writeHead(302, { location: target.url })
        response.end()
      })

      try {
        await expect(
          CoreActions_.transaction.fill(client, {
            account: userAccount.address,
            calls: [
              Actions.token.transfer.call(caller, {
                token: Tempo.alphaUsd,
                to: recipient.address,
                amount: 1n,
              }),
            ],
            feePayer: redirect.url as never,
          }),
        ).rejects.toThrow()
        expect(targetRequests).toBe(0)
      } finally {
        await redirect.close()
        await target.close()
      }
    })

    test('behavior: relays sponsor metadata from app relay', async () => {
      const result = await CoreActions_.transaction.fill(client, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
        feePayer: appServer.url as never,
      })

      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.sponsored,
      ).toBe(true)
      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.sponsor,
      ).toMatchInlineSnapshot(`
      {
        "address": "${feePayerAccount.address}",
        "name": "App Sponsor",
        "url": "https://app.example.com",
      }
    `)
    })

    test('behavior: sponsored tx from app relay can be signed and broadcast', async () => {
      const { transaction } = await CoreActions_.transaction.fill(client, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
        feePayer: appServer.url as never,
      })
      const signed = await userAccount.signTransaction(transaction as never)
      const receipt = (await Tempo.getClient({}).request({
        method: 'eth_sendRawTransactionSync',
        params: [signed],
      })) as { feePayer?: string | undefined }

      expect((receipt as TempoReceipt_).feePayer).toBe(
        feePayerAccount.address.toLowerCase(),
      )
    })
  },
)

describe.skipIf(nodeEnv !== 'localnet')(
  'behavior: app-provided feePayer URL bypasses wallet validate',
  () => {
    let appServer: Server
    let walletServer: Server
    let client: CoreClient_.Client<typeof chain_>

    beforeAll(async () => {
      // App relay is the authoritative sponsor — it has its own fee payer
      // account and signs sponsored transactions.
      const appRelay = Relay.create({
        client: Tempo.getClient({
          batch: { multicall: { deployless: true } },
        }),
        plugins: [
          Relay.feePayer({
            account: feePayerAccount,
            name: 'App Sponsor',
            url: 'https://app.example.com',
          }),
        ],
      })

      appServer = await createHttpServer(createRequestListener(appRelay.fetch))

      // Wallet relay has its own fee payer with a `validate` that ALWAYS
      // rejects. This guards the wallet's own fee payer; it must NOT gate
      // sponsorship when the dapp supplies its own external feePayer URL.
      const walletRelay = Relay.create({
        resolveTokens: () => [],

        client: Tempo.getClient({
          batch: { multicall: { deployless: true } },
        }),
        plugins: [
          Relay.simulate(),
          Relay.feePayer({
            account: feePayerAccount,
            name: 'Wallet Sponsor',
            validate: () => false,
            allowedFeePayers: [appServer.url],
            internal_allowUnsafeUrls: true,
          }),
          Relay.feeToken(),
        ],
      })

      walletServer = await createHttpServer(
        createRequestListener(walletRelay.fetch),
      )

      client = Tempo.getClient({
        transport: tempoHttp_(walletServer.url),
      })
    })

    afterAll(async () => {
      await appServer.close()
      await walletServer.close()
    })

    test('behavior: external feePayer URL is sponsored even when wallet validate rejects', async () => {
      const result = await CoreActions_.transaction.fill(client, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
        feePayer: appServer.url as never,
      })

      expect(result.transaction.feePayerSignature).toBeDefined()
      expect(result.transaction.maxFeePerGas).toBeDefined()
      expect(result.transaction.maxFeePerGas).not.toBe(0n)
      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.sponsored,
      ).toBe(true)
      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.sponsor?.name,
      ).toBe('App Sponsor')
    })
  },
)

describe.skipIf(nodeEnv !== 'localnet')(
  'behavior: chainId path parameter',
  () => {
    let server: Server
    let client: CoreClient_.Client<typeof chain_>

    beforeAll(async () => {
      const relay = Relay.create<number>({
        client: Tempo.getClient({
          batch: { multicall: { deployless: true } },
        }),
        plugins: [Relay.feePayer()],
      })

      server = await createHttpServer(
        createRequestListener((request) =>
          relay.fetch(request, {
            chainId: Number(new URL(request.url).pathname.slice(1)),
          }),
        ),
      )
      client = Tempo.getClient({
        transport: tempoHttp_(`${server.url}/${chain_.id}`),
      })
    })

    afterAll(async () => {
      await server.close()
    })

    test('default: proxies RPC methods via /:chainId path', async () => {
      const chainId = await client.request({ method: 'eth_chainId' })
      expect(Number(chainId)).toMatchInlineSnapshot(`${chain_.id}`)
    })

    test('behavior: fills transaction via /:chainId path', async () => {
      const { transaction } = await CoreActions_.transaction.fill(client, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
      })

      expect(transaction.gas).toBeDefined()
      expect(transaction.nonce).toBeDefined()
    })

    test('behavior: handles batch requests via /:chainId path', async () => {
      const response = await fetch(`${server.url}/${chain_.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] },
          { jsonrpc: '2.0', id: 2, method: 'eth_chainId', params: [] },
        ]),
      })

      expect(response.status).toBe(200)
      const body = (await response.json()) as { id: number; result: string }[]
      expect(body).toHaveLength(2)
      expect(Number(body[0]!.result)).toBe(chain_.id)
      expect(Number(body[1]!.result)).toBe(chain_.id)
    })
  },
)

describe.skipIf(nodeEnv !== 'localnet')('behavior: capabilities', () => {
  let server: Server
  let client: CoreClient_.Client<typeof chain_>

  beforeAll(async () => {
    const relay = Relay.create({
      resolveTokens: () => [],

      client: Tempo.getClient({
        batch: { multicall: { deployless: true } },
      }),
      plugins: [Relay.simulate(), Relay.feePayer(), Relay.feeToken()],
    })

    server = await createHttpServer(createRequestListener(relay.fetch))
    client = Tempo.getClient({
      transport: tempoHttp_(server.url),
    })
  })

  afterAll(async () => {
    await server.close()
  })

  test('default: returns fee and sponsored info', async () => {
    const result = await CoreActions_.transaction.fill(client, {
      account: userAccount.address,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.alphaUsd,
          to: recipient.address,
          amount: 1n,
        }),
      ],
    })
    const meta = result.capabilities as
      | TempoCapabilities_.FillTransactionCapabilities
      | undefined

    expect(meta?.fee).toBeDefined()
    expect(meta?.fee?.decimals).toBe(6)
    expect(meta?.fee?.symbol).toBe('AlphaUSD')
    expect(meta?.sponsored).toBe(false)
  })

  test('behavior: token transfer produces balance diffs', async () => {
    const sender = TempoAccount_.fromSecp256k1(Tempo.accounts[6]!.privateKey)
    const recipient = TempoAccount_.fromSecp256k1(Tempo.accounts[7]!.privateKey)
    const token = Tempo.alphaUsd

    // Sender is faucet-funded with alphaUsd (enough for transfer + fee).
    // Set fee token so relay doesn't need pathUSD balance.
    await CoreActions_.transaction.waitForReceipt(caller, {
      hash: await Actions.fee.setUserToken(Tempo.getClient({}), {
        account: sender,
        token,
      }),
    })

    const { data, to: callTo } = Actions.token.transfer.call(caller, {
      token,
      to: recipient.address,
      amount: 100n,
    })
    const result = await CoreActions_.transaction.fill(client, {
      account: sender.address,
      to: callTo,
      data,
    })

    const meta = result.capabilities as
      | TempoCapabilities_.FillTransactionCapabilities
      | undefined
    const senderDiffs = findDiffs(meta?.balanceDiffs, sender.address)!
    const tokenDiff = senderDiffs.find(
      (d) => d.address.toLowerCase() === token.toLowerCase(),
    )!
    expect(tokenDiff.decimals).toBe(6)
    expect(tokenDiff.direction).toBe('outgoing')
    expect(tokenDiff.formatted).toBe('0.0001')
    expect(tokenDiff.symbol).toBe('AlphaUSD')
    expect(tokenDiff.value).toBe('0x64')
  })

  test('behavior: resolves direct virtual-address targets', async () => {
    const virtualAddress = VirtualAddress.from({
      masterId: '0xffffffff',
      userTag: '0x000000000001',
    })

    const result = await CoreActions_.transaction.fill(client, {
      account: userAccount.address,
      to: virtualAddress,
    })

    expect(virtualAddresses(result.capabilities)).toMatchInlineSnapshot(`
{
  "0xfffffffffdfdfdfdfdfdfdfdfdfd000000000001": null,
}
    `)
  })

  test('behavior: resolves TIP-20 memo transfer virtual-address recipients', async () => {
    const virtualAddress = VirtualAddress.from({
      masterId: '0xfffffffe',
      userTag: '0x000000000002',
    })

    const result = await CoreActions_.transaction.fill(client, {
      account: userAccount.address,
      calls: [
        Actions.token.transfer.call(caller, {
          amount: 1n,
          memo: '0x01',
          to: virtualAddress,
          token: Tempo.alphaUsd,
        }),
      ],
      capabilities: { errors: true },
    })

    expect(virtualAddresses(result.capabilities)).toMatchInlineSnapshot(`
{
  "0xfffffffefdfdfdfdfdfdfdfdfdfd000000000002": null,
}
    `)
  })

  test('behavior: approve + dex swap + transfer produces balance diffs', async () => {
    const sender = TempoAccount_.fromSecp256k1(Tempo.accounts[8]!.privateKey)
    const recipient = TempoAccount_.fromSecp256k1(Tempo.accounts[7]!.privateKey)

    // Set up token pair + DEX liquidity.
    const rpc = Tempo.getClient({
      account: TempoAccount_.fromSecp256k1(Tempo.accounts[0]!.privateKey),
    })
    const { token: quote } = await Actions.token.createSync(rpc, {
      name: 'Test Quote',
      symbol: 'TQUOTE',
      currency: 'USD',
    })
    const { token: base } = await Actions.token.createSync(rpc, {
      name: 'Test Base',
      symbol: 'TBASE',
      currency: 'USD',
      quoteToken: quote,
    })
    await CoreActions_.transaction.sendSync(rpc, {
      calls: [
        Actions.token.grantRoles.call(caller, {
          token: base,
          role: 'issuer',
          to: rpc.account!.address,
        }),
        Actions.token.grantRoles.call(caller, {
          token: quote,
          role: 'issuer',
          to: rpc.account!.address,
        }),
        Actions.token.mint.call(caller, {
          token: base,
          to: rpc.account!.address,
          amount: parseUnits('10000', 6),
        }),
        Actions.token.mint.call(caller, {
          token: quote,
          to: rpc.account!.address,
          amount: parseUnits('10000', 6),
        }),
        Actions.token.approve.call(caller, {
          token: base,
          spender: Addresses.stablecoinDex,
          amount: parseUnits('10000', 6),
        }),
        Actions.token.approve.call(caller, {
          token: quote,
          spender: Addresses.stablecoinDex,
          amount: parseUnits('10000', 6),
        }),
      ],
    })
    await Actions.dex.createPairSync(rpc, { base })
    await Actions.dex.placeSync(rpc, {
      token: base,
      amount: parseUnits('500', 6),
      type: 'sell',
      tick: Tick.fromPrice('1.001'),
    })

    // Fund sender with quote tokens; alphaUsd fees come from the faucet.
    await Actions.token.mintSync(rpc, {
      token: quote,
      amount: parseUnits('1000', 6),
      to: sender.address,
    })
    await CoreActions_.transaction.waitForReceipt(caller, {
      hash: await Actions.fee.setUserToken(
        Tempo.getClient({ account: sender }),
        {
          token: Tempo.alphaUsd,
        },
      ),
    })

    const buyAmount = parseUnits('10', 6)
    const result = await CoreActions_.transaction.fill(client, {
      account: sender.address,
      calls: [
        Actions.token.approve.call(caller, {
          token: quote,
          spender: Addresses.stablecoinDex,
          amount: parseUnits('100', 6),
        }),
        Actions.dex.buy.call({
          tokenIn: quote,
          tokenOut: base,
          amountOut: buyAmount,
          maxAmountIn: parseUnits('100', 6),
        }),
        Actions.token.transfer.call(caller, {
          token: base,
          to: recipient.address,
          amount: buyAmount,
        }),
      ],
    })
    const meta = result.capabilities as
      | TempoCapabilities_.FillTransactionCapabilities
      | undefined

    const diffs = findDiffs(meta?.balanceDiffs, sender.address)!
    expect(diffs).toHaveLength(1)

    const quoteDiff = diffs[0]!
    expect(quoteDiff.address.toLowerCase()).toBe(quote.toLowerCase())
    expect(quoteDiff.direction).toBe('outgoing')
    expect(quoteDiff.symbol).toBe('TQUOTE')
    expect(quoteDiff.name).toBe('Test Quote')
    expect(quoteDiff.decimals).toBe(6)
    // No base diff — bought and immediately transferred out (net zero).
    expect(
      diffs.find((d) => d.address.toLowerCase() === base.toLowerCase()),
    ).toBeUndefined()
  })

  test('behavior: transfer to a spender retains approval exposure', async () => {
    const sender = TempoAccount_.fromSecp256k1(Tempo.accounts[6]!.privateKey)
    const recipient = TempoAccount_.fromSecp256k1(Tempo.accounts[7]!.privateKey)
    const token = Tempo.alphaUsd

    // Transferring to the spender does not consume its allowance.
    const result = await CoreActions_.transaction.fill(client, {
      account: sender.address,
      calls: [
        Actions.token.approve.call(caller, {
          token,
          spender: recipient.address,
          amount: 100n,
        }),
        Actions.token.transfer.call(caller, {
          token,
          to: recipient.address,
          amount: 100n,
        }),
      ],
    })
    const meta = result.capabilities as
      | TempoCapabilities_.FillTransactionCapabilities
      | undefined

    const diffs = findDiffs(meta?.balanceDiffs, sender.address)!
    const tokenDiff = diffs.find(
      (d) => d.address.toLowerCase() === token.toLowerCase(),
    )!
    // Include both the transfer and the outstanding approval.
    expect(tokenDiff.value).toBe('0xc8')
    expect(tokenDiff.direction).toBe('outgoing')
  })

  test('behavior: uncovered approval shows as outgoing', async () => {
    const sender = TempoAccount_.fromSecp256k1(Tempo.accounts[6]!.privateKey)
    const spender = TempoAccount_.fromSecp256k1(Tempo.accounts[7]!.privateKey)
    const token = Tempo.alphaUsd

    // The full approval remains available after the direct transfer.
    const result = await CoreActions_.transaction.fill(client, {
      account: sender.address,
      calls: [
        Actions.token.approve.call(caller, {
          token,
          spender: spender.address,
          amount: 200n,
        }),
        Actions.token.transfer.call(caller, {
          token,
          to: spender.address,
          amount: 50n,
        }),
      ],
    })
    const meta = result.capabilities as
      | TempoCapabilities_.FillTransactionCapabilities
      | undefined

    const diffs = findDiffs(meta?.balanceDiffs, sender.address)!
    const tokenDiff = diffs.find(
      (d) => d.address.toLowerCase() === token.toLowerCase(),
    )!
    // Transfer exposure is 50 and approval exposure is 200.
    expect(tokenDiff.value).toBe('0xfa')
    expect(tokenDiff.direction).toBe('outgoing')
  })
})

describe.skipIf(nodeEnv !== 'localnet')(
  'behavior: conditional sponsoring',
  () => {
    let server: Server
    let client: CoreClient_.Client<typeof chain_>

    beforeAll(async () => {
      // accounts[3] is faucet-funded with alphaUsd so transfers succeed.
      await CoreActions_.transaction.waitForReceipt(caller, {
        hash: await Actions.fee.setUserToken(Tempo.getClient({}), {
          account: TempoAccount_.fromSecp256k1(Tempo.accounts[3]!.privateKey),
          token: Tempo.alphaUsd,
        }),
      })

      const relay = Relay.create({
        client: Tempo.getClient({
          batch: { multicall: { deployless: true } },
        }),
        plugins: [
          Relay.feePayer({
            account: feePayerAccount,
            name: 'Test Sponsor',
            url: 'https://test.com',
            validate: (request) =>
              request.from?.toLowerCase() !==
              TempoAccount_.fromSecp256k1(
                Tempo.accounts[3]!.privateKey,
              ).address.toLowerCase(),
          }),
        ],
      })

      server = await createHttpServer(createRequestListener(relay.fetch))
      client = Tempo.getClient({
        transport: tempoHttp_(server.url),
      })
    })

    afterAll(async () => {
      await server.close()
    })

    test('behavior: approved tx is sponsored and can be broadcast', async () => {
      const { transaction } = await CoreActions_.transaction.fill(client, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
      })
      expect(transaction.feePayerSignature).toBeDefined()

      const signed = await userAccount.signTransaction(transaction as never)
      const receipt = (await Tempo.getClient({}).request({
        method: 'eth_sendRawTransactionSync',
        params: [signed],
      })) as { feePayer?: string | undefined }

      expect((receipt as TempoReceipt_).feePayer).toBe(
        feePayerAccount.address.toLowerCase(),
      )
    })

    test('behavior: rejected tx is not sponsored and can be self-paid', async () => {
      const sender = TempoAccount_.fromSecp256k1(Tempo.accounts[3]!.privateKey)
      const result = await CoreActions_.transaction.fill(client, {
        account: sender.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
      })
      expect(result.transaction.feePayerSignature).toBeUndefined()

      const meta = result.capabilities as
        | TempoCapabilities_.FillTransactionCapabilities
        | undefined
      expect(meta?.sponsored).toBe(false)
      expect(meta?.sponsor).toBeUndefined()

      const serialized = (await Transaction.serialize(
        result.transaction as never,
      )) as `0x76${string}`
      const envelope = TxEnvelopeTempo.deserialize(serialized)
      const signature = await sender.sign({
        hash: TxEnvelopeTempo.getSignPayload(envelope),
      })
      const signed = TxEnvelopeTempo.serialize(envelope, {
        signature: SignatureEnvelope.from(signature),
      })
      const receipt = (await Tempo.getClient({}).request({
        method: 'eth_sendRawTransactionSync',
        params: [signed],
      })) as { feePayer?: string | undefined }

      // Sender pays their own fee — no external fee payer.
      expect((receipt as TempoReceipt_).feePayer).not.toBe(
        feePayerAccount.address.toLowerCase(),
      )
    })
  },
)

describe.skipIf(nodeEnv !== 'localnet')(
  'behavior: path A — guaranteed sponsorship (no validate)',
  () => {
    let server: Server
    let client: CoreClient_.Client<typeof chain_>
    let requests: Relay.handleRequest.Request[] = []

    beforeAll(async () => {
      const relay = Relay.create({
        resolveTokens: () => localnetTokens,

        client: Tempo.getClient({
          batch: { multicall: { deployless: true } },
        }),
        plugins: [
          {
            async handleRequest(context, next) {
              const { request } = context
              requests.push(request)
              return next()
            },
          },
          Relay.simulate(),
          Relay.feePayer({
            account: feePayerAccount,
            name: 'Path A Sponsor',
          }),
          Relay.feeToken(),
        ],
      })

      server = await createHttpServer(createRequestListener(relay.fetch))
      client = Tempo.getClient({
        transport: tempoHttp_(server.url),
      })
    })

    afterAll(async () => {
      await server.close()
    })

    afterEach(() => {
      requests = []
    })

    test('behavior: skips fee token resolution and sponsors', async () => {
      const result = await CoreActions_.transaction.fill(client, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
      })

      expect(result.transaction.feePayerSignature).toBeDefined()
      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.sponsored,
      ).toBe(true)
      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.sponsor?.name,
      ).toBe('Path A Sponsor')
      // Only one fill request — no fee token resolution round-trip.
      expect(
        requests.filter((r) => r.method === 'eth_fillTransaction'),
      ).toHaveLength(1)
    })

    test('behavior: returns fee even when no feeToken in request', async () => {
      const result = await CoreActions_.transaction.fill(client, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
      })

      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.fee,
      ).toBeDefined()
      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.fee?.decimals,
      ).toBeTypeOf('number')
      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.fee?.symbol,
      ).toBeTypeOf('string')
      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.fee?.formatted,
      ).toBeTypeOf('string')
    })

    test('behavior: simulate and sign run concurrently with fill', async () => {
      const result = await CoreActions_.transaction.fill(client, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
      })

      // All capabilities are present despite parallel execution.
      expect(result.transaction.feePayerSignature).toBeDefined()
      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.sponsored,
      ).toBe(true)
    })

    test('behavior: defaults feeToken to chain default when caller omits it', async () => {
      // Without the default, the broadcast envelope has no feeToken and
      // the chain falls back to the sender's account token, which often
      // lacks FeeAMM liquidity.
      const result = await CoreActions_.transaction.fill(client, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
      })

      expect(result.transaction.feeToken?.toLowerCase()).toBe(
        localnetTokens[0].toLowerCase(),
      )
    })

    test('behavior: preserves caller-supplied feeToken', async () => {
      const result = await CoreActions_.transaction.fill(client, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
        feeToken: Tempo.alphaUsd as Address,
      })

      expect(result.transaction.feeToken?.toLowerCase()).toBe(
        Tempo.alphaUsd.toLowerCase(),
      )
    })
  },
)

describe.skipIf(nodeEnv !== 'localnet')(
  'behavior: path B — conditional sponsorship (validate)',
  () => {
    let server: Server
    let client: CoreClient_.Client<typeof chain_>
    let requests: Relay.handleRequest.Request[] = []

    // Reject accounts[3], approve everyone else.
    const rejectedSender = TempoAccount_.fromSecp256k1(
      Tempo.accounts[3]!.privateKey,
    )

    beforeAll(async () => {
      // rejectedSender is faucet-funded with alphaUsd so it can self-pay.
      await CoreActions_.transaction.waitForReceipt(caller, {
        hash: await Actions.fee.setUserToken(Tempo.getClient({}), {
          account: rejectedSender,
          token: Tempo.alphaUsd,
        }),
      })

      const relay = Relay.create({
        resolveTokens: () => [],

        client: Tempo.getClient({
          batch: { multicall: { deployless: true } },
        }),
        plugins: [
          {
            async handleRequest(context, next) {
              const { request } = context
              requests.push(request)
              return next()
            },
          },
          Relay.simulate(),
          Relay.feePayer({
            account: feePayerAccount,
            name: 'Path B Sponsor',
            validate: (request) =>
              request.from?.toLowerCase() !==
              rejectedSender.address.toLowerCase(),
          }),
          Relay.feeToken(),
        ],
      })

      server = await createHttpServer(createRequestListener(relay.fetch))
      client = Tempo.getClient({
        transport: tempoHttp_(server.url),
      })
    })

    afterAll(async () => {
      await server.close()
    })

    afterEach(() => {
      requests = []
    })

    test('behavior: approved sender gets sponsorship with parallel fills', async () => {
      const result = await CoreActions_.transaction.fill(client, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
      })

      expect(result.transaction.feePayerSignature).toBeDefined()
      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.sponsored,
      ).toBe(true)
      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.sponsor?.name,
      ).toBe('Path B Sponsor')
    })

    test('behavior: rejected sender gets unsponsored tx from parallel fill', async () => {
      const result = await CoreActions_.transaction.fill(client, {
        account: rejectedSender.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
      })

      expect(result.transaction.feePayerSignature).toBeUndefined()
      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.sponsored,
      ).toBe(false)
      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.sponsor,
      ).toBeUndefined()
    })

    test('behavior: rejected tx can be signed and broadcast by sender', async () => {
      const result = await CoreActions_.transaction.fill(client, {
        account: rejectedSender.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
      })

      const serialized = (await Transaction.serialize(
        result.transaction as never,
      )) as `0x76${string}`
      const envelope = TxEnvelopeTempo.deserialize(serialized)
      const signature = await rejectedSender.sign({
        hash: TxEnvelopeTempo.getSignPayload(envelope),
      })
      const signed = TxEnvelopeTempo.serialize(envelope, {
        signature: SignatureEnvelope.from(signature),
      })
      const receipt = (await Tempo.getClient({}).request({
        method: 'eth_sendRawTransactionSync',
        params: [signed],
      })) as { feePayer?: string | undefined }

      expect((receipt as TempoReceipt_).feePayer).not.toBe(
        feePayerAccount.address.toLowerCase(),
      )
    })
  },
)

describe.skipIf(nodeEnv !== 'localnet')(
  'behavior: path C — no sponsorship',
  () => {
    let server: Server
    let client: CoreClient_.Client<typeof chain_>
    let requests: Relay.handleRequest.Request[] = []

    beforeAll(async () => {
      const relay = Relay.create({
        resolveTokens: () => [],

        client: Tempo.getClient({
          batch: { multicall: { deployless: true } },
        }),
        plugins: [
          {
            async handleRequest(context, next) {
              const { request } = context
              requests.push(request)
              return next()
            },
          },
          Relay.simulate(),
          Relay.feePayer(),
          Relay.feeToken(),
        ],
      })

      server = await createHttpServer(createRequestListener(relay.fetch))
      client = Tempo.getClient({
        transport: tempoHttp_(server.url),
      })
    })

    afterAll(async () => {
      await server.close()
    })

    afterEach(() => {
      requests = []
    })

    test('behavior: resolves fee token and fills without sponsorship', async () => {
      const result = await CoreActions_.transaction.fill(client, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
      })

      expect(result.transaction.feePayerSignature).toBeUndefined()
      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.sponsored,
      ).toBe(false)
      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.fee,
      ).toBeDefined()
      // Single fill — no speculative second fill.
      expect(
        requests.filter((r) => r.method === 'eth_fillTransaction'),
      ).toHaveLength(1)
    })

    test('behavior: simulation includes fees for an unsponsored fill', async () => {
      const result = await CoreActions_.transaction.fill(client, {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
      })

      // Capabilities are populated despite parallel execution.
      expect(result.transaction.gas).toBeDefined()
      expect(result.transaction.nonce).toBeDefined()
      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.fee,
      ).toBeDefined()
      expect(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.sponsored,
      ).toBe(false)
    })
  },
)

describe.skipIf(nodeEnv !== 'localnet')(
  'behavior: fee token resolution',
  () => {
    const feeTokenAccount = TempoAccount_.fromSecp256k1(
      Tempo.accounts[0]!.privateKey,
    )
    const preferredToken = Tempo.alphaUsd
    let server: Server
    let client: CoreClient_.Client<typeof chain_>

    beforeAll(async () => {
      // feeTokenAccount is faucet-funded with alphaUsd so the balance check passes.
      // Set on-chain fee token preference.
      await CoreActions_.transaction.waitForReceipt(caller, {
        hash: await Actions.fee.setUserToken(Tempo.getClient({}), {
          account: feeTokenAccount,
          token: preferredToken,
        }),
      })

      const relay = Relay.create({
        resolveTokens: () => localnetTokens,

        client: Tempo.getClient({
          batch: { multicall: { deployless: true } },
        }),
        plugins: [Relay.simulate(), Relay.feePayer(), Relay.feeToken()],
      })

      server = await createHttpServer(createRequestListener(relay.fetch))
      client = Tempo.getClient({
        transport: tempoHttp_(server.url),
      })
    })

    afterAll(async () => {
      await server.close()
    })

    test('behavior: uses explicitly provided feeToken', async () => {
      const feeToken = '0x20c0000000000000000000000000000000000001'
      const { transaction } = await CoreActions_.transaction.fill(client, {
        account: feeTokenAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
        feeToken,
      })

      expect(transaction.feeToken).toBe(feeToken)
    })

    test('behavior: resolves to onchain user token when it has balance', async () => {
      const { transaction } = await CoreActions_.transaction.fill(client, {
        account: feeTokenAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
      })

      expect(transaction.feeToken).toBe(preferredToken)
    })

    test('behavior: resolves to highest-balance token from token list', async () => {
      // Create two fresh TIP-20s and mint different amounts to an account that is
      // NOT faucet-funded, so only these two balances influence resolution
      // (a faucet-funded account would carry genesis balances that dominate).
      // The relay's tokenlist is restricted to just these two so the
      // highest-balance resolver picks between them deterministically.
      const freshAccount = TempoAccount_.fromSecp256k1(generatePrivateKey())
      const rpc = Tempo.getClient({
        account: TempoAccount_.fromSecp256k1(Tempo.accounts[0]!.privateKey),
      })
      const { token: lowUsd } = await Actions.token.createSync(rpc, {
        name: 'LowUSD',
        symbol: 'LowUSD',
        currency: 'USD',
        quoteToken: Tempo.alphaUsd,
      })
      const { token: highUsd } = await Actions.token.createSync(rpc, {
        name: 'HighUSD',
        symbol: 'HighUSD',
        currency: 'USD',
        quoteToken: Tempo.alphaUsd,
      })
      await CoreActions_.transaction.sendSync(rpc, {
        calls: [
          Actions.token.grantRoles.call(caller, {
            token: lowUsd,
            role: 'issuer',
            to: rpc.account!.address,
          }),
          Actions.token.grantRoles.call(caller, {
            token: highUsd,
            role: 'issuer',
            to: rpc.account!.address,
          }),
          Actions.token.mint.call(caller, {
            token: lowUsd,
            amount: parseUnits('100', 6),
            to: freshAccount.address,
          }),
          Actions.token.mint.call(caller, {
            token: highUsd,
            amount: parseUnits('500', 6),
            to: freshAccount.address,
          }),
        ],
      })

      // Both candidates need fee liquidity so their balances determine the selection.
      for (const token of [lowUsd, highUsd])
        await Actions.amm.mintSync(rpc, {
          userTokenAddress: token,
          validatorTokenAddress: Tempo.pathUsd,
          validatorTokenAmount: parseUnits('10', 6),
          to: rpc.account.address,
        })

      const customRelay = Relay.create({
        resolveTokens: () => [lowUsd, highUsd],

        client: Tempo.getClient({
          batch: { multicall: { deployless: true } },
        }),
        plugins: [Relay.simulate(), Relay.feePayer(), Relay.feeToken()],
      })

      const customServer = await createHttpServer(
        createRequestListener(customRelay.fetch),
      )
      const customClient = Tempo.getClient({
        transport: tempoHttp_(customServer.url),
      })

      const { transaction } = await CoreActions_.transaction.fill(
        customClient,
        {
          account: freshAccount.address,
          calls: [
            Actions.token.transfer.call(caller, {
              token: highUsd,
              to: recipient.address,
              amount: 1n,
            }),
          ],
        },
      )
      await customServer.close()

      // highUsd has the higher balance (500 > 100).
      expect(transaction.feeToken?.toLowerCase()).toBe(highUsd.toLowerCase())
    })

    test('behavior: falls back to pathUSD when no preference or balances', async () => {
      const freshAccount = TempoAccount_.fromSecp256k1(
        Tempo.accounts[10]!.privateKey,
      )
      const { transaction } = await CoreActions_.transaction.fill(client, {
        account: freshAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: freshAccount.address,
            amount: 0n,
          }),
        ],
      })

      expect(transaction.feeToken).toBeUndefined()
    })
  },
)

describe.skipIf(nodeEnv !== 'localnet')('behavior: error capabilities', () => {
  let server: Server
  let client: CoreClient_.Client<typeof chain_>

  beforeAll(async () => {
    const relay = Relay.create({
      resolveTokens: () => [],

      client: Tempo.getClient({
        batch: { multicall: { deployless: true } },
      }),
      plugins: [Relay.simulate(), Relay.feePayer(), Relay.feeToken()],
    })

    server = await createHttpServer(createRequestListener(relay.fetch))
    client = Tempo.getClient({
      transport: tempoHttp_(server.url),
    })
  })

  afterAll(async () => {
    await server.close()
  })

  test('behavior: returns insufficientFunds on InsufficientBalance when errors capability is enabled', async () => {
    const sender = TempoAccount_.fromSecp256k1(Tempo.accounts[10]!.privateKey)

    const result = await CoreActions_.transaction.fill(client, {
      account: sender.address,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.alphaUsd,
          to: recipient.address,
          amount: parseUnits('100', 6),
        }),
      ],
      capabilities: { errors: true },
    })

    // Unlike the hosted snapshot, this node emits no optimistic transfer logs
    // for the unfunded zero address. Keep the complete local response snapshot.
    expect(result.capabilities).toMatchInlineSnapshot(`
      {
        "balanceDiffs": {
          "0x0eB552e73e6f8E0922749e0fB08af2a71ECb2b7F": [],
        },
        "error": {
          "abiItem": {
            "inputs": [
              {
                "name": "available",
                "type": "uint256",
              },
              {
                "name": "required",
                "type": "uint256",
              },
              {
                "name": "token",
                "type": "address",
              },
            ],
            "name": "InsufficientBalance",
            "type": "error",
          },
          "data": "0x832f98b500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005f5e10000000000000000000000000020c0000000000000000000000000000000000001",
          "errorName": "InsufficientBalance",
          "message": "Insufficient balance. Required: 100000000, available: 0.",
        },
        "insufficientFunds": {
          "amount": "0x5f5e100",
          "decimals": 6,
          "formatted": "100",
          "symbol": "AlphaUSD",
          "token": "0x20C0000000000000000000000000000000000001",
        },
        "sponsored": false,
      }
    `)
  })

  test('behavior: returns error capability on generic revert when errors capability is enabled', async () => {
    const sender = TempoAccount_.fromSecp256k1(Tempo.accounts[10]!.privateKey)

    const result = await CoreActions_.transaction.fill(client, {
      account: sender.address,
      calls: [
        Actions.token.grantRoles.call(caller, {
          token: Tempo.alphaUsd,
          role: 'issuer',
          to: sender.address,
        }),
      ],
      capabilities: { errors: true },
    })

    expect(result.capabilities).toMatchInlineSnapshot(`
      {
        "error": {
          "abiItem": {
            "inputs": [],
            "name": "Unauthorized",
            "type": "error",
          },
          "data": "0x82b42900",
          "errorName": "Unauthorized",
          "message": "Unauthorized.",
        },
        "sponsored": false,
      }
    `)
  })

  test('default: throws JSON-RPC error on InsufficientBalance', async () => {
    const sender = TempoAccount_.fromSecp256k1(Tempo.accounts[10]!.privateKey)
    const error = await CoreActions_.transaction
      .fill(client, {
        account: sender.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: parseUnits('100', 6),
          }),
        ],
      })
      .then(
        () => undefined,
        (e: BaseError) => e,
      )
    expect(error).toBeDefined()
    // Walk the viem error chain to the underlying RPC error. The default path
    // surfaces the chain revert as a JSON-RPC error (`code: 3`) with the
    // ABI-encoded `InsufficientBalance(uint256, uint256, address)` selector.
    const rpc = (
      error?.walk(isRpcError) as
        | { data: { code: number; data?: string } }
        | undefined
    )?.data
    expect(rpc?.data?.startsWith('0x832f98b5')).toBe(true)
  })

  test('default: throws JSON-RPC error on generic revert', async () => {
    const sender = TempoAccount_.fromSecp256k1(Tempo.accounts[10]!.privateKey)
    const error = await CoreActions_.transaction
      .fill(client, {
        account: sender.address,
        calls: [
          Actions.token.grantRoles.call(caller, {
            token: Tempo.alphaUsd,
            role: 'issuer',
            to: sender.address,
          }),
        ],
      })
      .then(
        () => undefined,
        (e: BaseError) => e,
      )
    expect(error).toBeDefined()
    const rpc = (
      error?.walk(isRpcError) as
        | { data: { code: number; data?: string } }
        | undefined
    )?.data
    // ABI-encoded `Unauthorized()`.
    expect(rpc?.data).toBe('0x82b42900')
  })

  test('behavior: explicit `errors: false` matches default JSON-RPC error behavior', async () => {
    const sender = TempoAccount_.fromSecp256k1(Tempo.accounts[10]!.privateKey)
    const error = await CoreActions_.transaction
      .fill(client, {
        account: sender.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: parseUnits('100', 6),
          }),
        ],
        capabilities: { errors: false } as never,
      })
      .then(
        () => undefined,
        (e: BaseError) => e,
      )
    expect(error).toBeDefined()
    const rpc = (
      error?.walk(isRpcError) as
        | { data: { code: number; data?: string } }
        | undefined
    )?.data
    expect(rpc?.data?.startsWith('0x832f98b5')).toBe(true)
  })
})

function isRpcError(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'data' in e &&
    typeof e.data === 'object' &&
    e.data !== null &&
    'code' in e.data &&
    e.data.code === 3
  )
}
