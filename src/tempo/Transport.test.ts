import * as Http from 'node:http'
import { createRequestListener } from '@remix-run/node-fetch-server'
import { Hex, RpcRequest, RpcResponse, Signature } from 'ox'
import { MultisigConfig, TxEnvelopeTempo } from 'ox/tempo'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import {
  getCallsStatus,
  getTransaction,
  getTransactionCount,
  prepareTransactionRequest,
  sendCallsSync,
  sendTransaction,
  sendTransactionSync,
  signTransaction,
} from 'viem/actions'
import { Account, Actions, Store, Transaction } from 'viem/tempo'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import {
  accounts,
  chain,
  feeToken,
  getClient,
  http,
} from '~test/tempo/config.js'
import { custom } from '../clients/transports/custom.js'
import * as Account_ from './Account.js'
import * as Transaction_ from './Transaction.js'
import {
  walletNamespaceCompat,
  withFeePayer,
  withMultisig,
  withRelay,
} from './Transport.js'

describe('withMultisig', () => {
  test('default', async () => {
    const client = getClient({
      transport: withMultisig(http(), { store: Store.memory() }),
    })

    expect(client.transport.multisig).toMatchInlineSnapshot(`true`)
    expect(client.transport.type).toMatchInlineSnapshot(`"http"`)
    await expect(
      client.request({
        method: 'multisig_getOperation',
        params: [`0x${'ff'.repeat(32)}`],
      } as never),
    ).resolves.toMatchInlineSnapshot(`null`)
  })

  test('error: non-atomic store', () => {
    const store = Store.from({
      getItem: async () => null,
      removeItem() {},
      setItem() {},
    })

    expect(() =>
      getClient({
        transport: withMultisig(http(), { store } as never),
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [RpcResponse.InvalidParamsError: Multisig coordination requires a store with atomic \`compareAndSet\`.]
    `)
  })
})

describe('withRelay', () => {
  let server: Http.Server
  let overrideSponsorFields = false
  let overrideSponsorNonce = false
  let sponsorFillFields:
    | {
        gas?: bigint | undefined
        maxFeePerGas?: bigint | undefined
        maxPriorityFeePerGas?: bigint | undefined
      }
    | undefined
  let sponsorFills = false
  let relayRequests: Array<{
    method: string
    params: readonly unknown[] | undefined
  }> = []

  test('behavior: routes multisig coordination to the relay', async () => {
    const owner = Account_.fromSecp256k1(generatePrivateKey())
    const config = MultisigConfig.from({
      owners: [{ owner: owner.address, weight: 1 }],
      threshold: 1,
    })
    const transaction = {
      calls: [{ data: '0xdeadbeef', to: accounts[20].address }],
      chainId: chain.id,
      multisigSimulation: {
        account: MultisigConfig.getAddress(config),
        approvals: [{ owner: owner.address, type: 'primitive' as const }],
        config,
      },
    } as const
    const signature = await owner.signTransaction(transaction)
    const serialized = await Transaction_.serialize({
      ...transaction,
      signatures: [signature],
    })
    const defaultMethods: string[] = []
    const relayMethods: string[] = []
    const transport = withRelay(
      custom({
        async request({ method }) {
          defaultMethods.push(method)
          return method
        },
      }),
      custom({
        async request({ method }) {
          relayMethods.push(method)
          return method
        },
      }),
    )({ chain })
    const hash = `0x${'01'.repeat(32)}`

    const results = await Promise.all(
      [
        { method: 'eth_sendRawTransaction', params: [serialized] },
        { method: 'eth_sendRawTransactionSync', params: [serialized] },
        {
          method: 'multisig_approveKeyAuthorization',
          params: [{ hash, signature }],
        },
        { method: 'multisig_approveRawTransaction', params: [serialized] },
        { method: 'multisig_approveRawTransactionSync', params: [serialized] },
        { method: 'multisig_getConfig', params: [{ address: owner.address }] },
        { method: 'multisig_getOperation', params: [hash] },
      ].map((request) => transport.request(request as never)),
    )

    expect(transport.value).toMatchInlineSnapshot(`
      {
        "multisig": true,
      }
    `)
    expect(results).toMatchInlineSnapshot(`
      [
        "eth_sendRawTransaction",
        "eth_sendRawTransactionSync",
        "multisig_approveKeyAuthorization",
        "multisig_approveRawTransaction",
        "multisig_approveRawTransactionSync",
        "multisig_getConfig",
        "multisig_getOperation",
      ]
    `)
    expect(defaultMethods).toMatchInlineSnapshot(`[]`)
    expect(relayMethods).toStrictEqual(results)
  })

  test('behavior: routes transaction lookups to their source', async () => {
    const transactionHash = `0x${'01'.repeat(32)}`
    const operationHash = `0x${'02'.repeat(32)}`
    const unknownHash = `0x${'03'.repeat(32)}`
    const unsupportedHash = `0x${'04'.repeat(32)}`
    const defaultRequests: string[] = []
    const relayRequests: string[] = []
    const transport = withRelay(
      custom({
        async request({ method, params }) {
          const hash = (params as readonly unknown[] | undefined)?.[0]
          defaultRequests.push(`${method}:${hash}`)
          if (hash === transactionHash)
            return { hash: transactionHash, source: 'default' }
          return null
        },
      }),
      custom({
        async request({ method, params }) {
          const hash = (params as readonly unknown[] | undefined)?.[0]
          relayRequests.push(`${method}:${hash}`)
          if (method === 'multisig_getOperation') {
            if (hash === operationHash) return { type: 'transaction' }
            if (hash === unsupportedHash)
              throw new RpcResponse.MethodNotSupportedError()
            throw new RpcResponse.MethodNotFoundError()
          }
          return { hash: operationHash, source: 'relay' }
        },
      }),
    )({ chain })

    const results = [
      await transport.request({
        method: 'eth_getTransactionByHash',
        params: [transactionHash],
      }),
      await transport.request({
        method: 'eth_getTransactionReceipt',
        params: [transactionHash],
      }),
      await transport.request({
        method: 'eth_getTransactionByHash',
        params: [operationHash],
      }),
      await transport.request({
        method: 'eth_getTransactionReceipt',
        params: [operationHash],
      }),
      await transport.request({
        method: 'eth_getTransactionReceipt',
        params: [unknownHash],
      }),
      await transport.request({
        method: 'eth_getTransactionReceipt',
        params: [unsupportedHash],
      }),
    ]

    expect(results).toMatchInlineSnapshot(`
      [
        {
          "hash": "0x0101010101010101010101010101010101010101010101010101010101010101",
          "source": "default",
        },
        {
          "hash": "0x0101010101010101010101010101010101010101010101010101010101010101",
          "source": "default",
        },
        {
          "hash": "0x0202020202020202020202020202020202020202020202020202020202020202",
          "source": "relay",
        },
        {
          "hash": "0x0202020202020202020202020202020202020202020202020202020202020202",
          "source": "relay",
        },
        null,
        null,
      ]
    `)
    expect(defaultRequests).toMatchInlineSnapshot(`
      [
        "eth_getTransactionByHash:0x0101010101010101010101010101010101010101010101010101010101010101",
        "eth_getTransactionReceipt:0x0101010101010101010101010101010101010101010101010101010101010101",
        "eth_getTransactionByHash:0x0202020202020202020202020202020202020202020202020202020202020202",
        "eth_getTransactionReceipt:0x0202020202020202020202020202020202020202020202020202020202020202",
        "eth_getTransactionReceipt:0x0303030303030303030303030303030303030303030303030303030303030303",
        "eth_getTransactionReceipt:0x0404040404040404040404040404040404040404040404040404040404040404",
      ]
    `)
    expect(relayRequests).toMatchInlineSnapshot(`
      [
        "multisig_getOperation:0x0202020202020202020202020202020202020202020202020202020202020202",
        "eth_getTransactionByHash:0x0202020202020202020202020202020202020202020202020202020202020202",
        "multisig_getOperation:0x0202020202020202020202020202020202020202020202020202020202020202",
        "eth_getTransactionReceipt:0x0202020202020202020202020202020202020202020202020202020202020202",
        "multisig_getOperation:0x0303030303030303030303030303030303030303030303030303030303030303",
        "multisig_getOperation:0x0404040404040404040404040404040404040404040404040404040404040404",
      ]
    `)
  })

  test('behavior: propagates relay transaction lookup failures', async () => {
    const transport = withRelay(
      custom({ request: async () => null }),
      custom({
        async request() {
          throw new RpcResponse.InternalError({
            message: 'Relay lookup failed.',
          })
        },
      }),
    )({ chain })

    await expect(
      transport.request(
        {
          method: 'eth_getTransactionByHash',
          params: [`0x${'05'.repeat(32)}`],
        },
        { retryCount: 0 },
      ),
    ).rejects.toThrow('Relay lookup failed.')
  })

  beforeAll(async () => {
    server = Http.createServer(
      createRequestListener(async (r) => {
        const feePayerClient = getClient({
          account: accounts[0],
        })

        const request = RpcRequest.from(
          await r.json(),
        ) as RpcRequest.RpcRequest<any>

        relayRequests.push({
          method: request.method,
          params: request.params,
        })

        if (request.method === 'eth_fillTransaction') {
          if (sponsorFills) {
            const params = structuredClone(request.params) as [
              Record<string, unknown>,
            ]
            if (overrideSponsorFields) {
              delete params[0].gas
              delete params[0].maxFeePerGas
              delete params[0].maxPriorityFeePerGas
            }
            if (overrideSponsorNonce) delete params[0].nonce
            const result = await feePayerClient.request({
              method: 'eth_fillTransaction',
              params: params as never,
            })
            const transaction = {
              ...Transaction.deserialize(result.raw as `0x76${string}`),
              feeToken,
            }
            sponsorFillFields = {
              gas: transaction.gas,
              maxFeePerGas: transaction.maxFeePerGas,
              maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ?? 0n,
            }
            const sender = (request.params?.[0] as { from: `0x${string}` }).from
            const feePayerSignature = Signature.from(
              await accounts[0].sign({
                hash: TxEnvelopeTempo.getFeePayerSignPayload(
                  TxEnvelopeTempo.from(transaction as never),
                  { sender },
                ),
              }),
            )

            return Response.json(
              RpcResponse.from({
                id: request.id,
                jsonrpc: request.jsonrpc,
                result: {
                  ...result,
                  tx: {
                    ...result.tx,
                    feePayerSignature: Signature.toRpc(feePayerSignature),
                    feeToken,
                  },
                },
              }),
            )
          }

          return Response.json(
            RpcResponse.from({
              id: request.id,
              jsonrpc: request.jsonrpc,
              result: request.params?.[0],
            }),
          )
        }

        if (
          request.method === 'eth_getTransactionByHash' ||
          request.method === 'eth_getTransactionReceipt'
        ) {
          const result = await feePayerClient.request({
            method: request.method,
            params: request.params,
          } as never)
          return Response.json(
            RpcResponse.from({
              id: request.id,
              jsonrpc: request.jsonrpc,
              result,
            }),
          )
        }

        if (
          (request as any).method !== 'eth_signRawTransaction' &&
          request.method !== 'eth_sendRawTransaction' &&
          request.method !== 'eth_sendRawTransactionSync'
        )
          return Response.json(
            RpcResponse.from({
              error: new RpcResponse.InvalidParamsError({
                message: 'unsupported method',
              }),
              id: request.id,
              jsonrpc: request.jsonrpc,
            }),
          )

        const serialized = request.params?.[0] as `0x76${string}`

        const transaction = Transaction.deserialize(serialized)
        const serializedTransaction = await signTransaction(feePayerClient, {
          ...transaction,
          feePayer: feePayerClient.account,
        })

        if ((request as any).method === 'eth_signRawTransaction') {
          return Response.json(
            RpcResponse.from({
              id: request.id,
              jsonrpc: request.jsonrpc,
              result: serializedTransaction,
            }),
          )
        }

        const result = await feePayerClient.request({
          method: request.method,
          params: [serializedTransaction],
        } as never)

        return Response.json(
          RpcResponse.from({
            id: request.id,
            jsonrpc: request.jsonrpc,
            result,
          }),
        )
      }),
    ).listen(3051)
  })

  afterAll(() => {
    server.close()
  })

  beforeEach(() => {
    overrideSponsorFields = false
    overrideSponsorNonce = false
    sponsorFillFields = undefined
    sponsorFills = false
    relayRequests = []
  })

  describe('policy: sign-only (default)', () => {
    const client = getClient({
      transport: withRelay(http(), http('http://localhost:3051')),
    })

    test('behavior: sendTransaction with feePayer: true', async () => {
      const account = privateKeyToAccount(
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      const receipt = await sendTransactionSync(client, {
        account,
        feePayer: true,
        to: '0x0000000000000000000000000000000000000000',
      })

      expect(receipt.status).toBe('success')
      expect(receipt.feePayer).toBe(accounts[0].address.toLowerCase())
      expect(relayRequests).toHaveLength(2)
      expect(relayRequests).toContainEqual({
        method: 'eth_fillTransaction',
        params: expect.any(Array),
      })
      expect(relayRequests).toContainEqual({
        method: 'eth_signRawTransaction',
        params: expect.any(Array),
      })
    })

    test('behavior: access key preserves fill-time sponsorship', async () => {
      sponsorFills = true
      const account = Account.fromSecp256k1(generatePrivateKey())
      const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
        access: account,
      })
      const keyAuthorization = await Actions.accessKey.signAuthorization(
        client,
        { account, accessKey },
      )

      const receipt = await sendTransactionSync(client, {
        account: accessKey,
        feePayer: true,
        keyAuthorization,
        to: '0x0000000000000000000000000000000000000000',
      })

      expect(receipt.status).toBe('success')
      expect(relayRequests.map(({ method }) => method)).toEqual([
        'eth_fillTransaction',
      ])
    })

    test('behavior: preserves relay fields covered by fee payer signature', async () => {
      sponsorFills = true
      overrideSponsorFields = true
      const account = privateKeyToAccount(
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      const receipt = await sendTransactionSync(client, {
        account,
        feePayer: true,
        gas: 1n,
        maxFeePerGas: 1n,
        maxPriorityFeePerGas: 1n,
        to: '0x0000000000000000000000000000000000000000',
      })

      expect(receipt.status).toBe('success')
      expect(receipt.feePayer).toBe(accounts[0].address.toLowerCase())
      const transaction = await getTransaction(client, {
        hash: receipt.transactionHash,
      })
      expect(sponsorFillFields).toBeDefined()
      expect(transaction).toMatchObject(sponsorFillFields!)
      expect(relayRequests.map(({ method }) => method)).toEqual([
        'eth_fillTransaction',
      ])
    })

    test('error: rejects a fee-payer-signed nonce mismatch', async () => {
      sponsorFills = true
      overrideSponsorNonce = true
      const account = privateKeyToAccount(
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )
      const nonce = await getTransactionCount(client, {
        address: account.address,
        blockTag: 'pending',
      })

      await expect(
        sendTransactionSync(client, {
          account,
          feePayer: true,
          nonce: nonce + 1,
          to: '0x0000000000000000000000000000000000000000',
        }),
      ).rejects.toThrow(
        'The filled transaction nonce does not match the requested nonce.',
      )
      expect(relayRequests.map(({ method }) => method)).toEqual([
        'eth_fillTransaction',
      ])
    })

    test('behavior: sendTransaction still gets sponsored via feePayer: true when nonce/gas/fees are pre-populated', async () => {
      const account = privateKeyToAccount(
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      // Pre-populate nonce/gas/fees, simulating a caller that has already
      // fully filled out the transaction envelope before calling
      // `prepareTransactionRequest` (e.g. because a wallet SDK filled them
      // in separately). Historically this caused `prepareTransactionRequest`
      // to skip the `eth_fillTransaction` call entirely (its heuristic
      // assumes nothing is left to fill), which meant the fee-payer
      // signature -- only obtainable as a side effect of that call -- was
      // silently never attached, even though `feePayer: true` was set.
      const nonce = await prepareTransactionRequest(client, {
        account,
        parameters: ['nonce'],
        to: '0x0000000000000000000000000000000000000000',
      }).then((request) => request.nonce)

      const receipt = await sendTransactionSync(client, {
        account,
        chainId: chain.id,
        feePayer: true,
        gas: 100_000n,
        maxFeePerGas: 10_000_000_000n,
        maxPriorityFeePerGas: 1_000_000_000n,
        nonce,
        to: '0x0000000000000000000000000000000000000000',
      })

      expect(receipt.status).toBe('success')
      expect(receipt.feePayer).toBe(accounts[0].address.toLowerCase())
      expect(relayRequests).toContainEqual({
        method: 'eth_fillTransaction',
        params: expect.any(Array),
      })
    })

    test('behavior: sendTransaction still gets sponsored via feePayer: true when the caller restricts `parameters` to omit fees/gas, even with a fully-populated envelope', async () => {
      const account = privateKeyToAccount(
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      // The feePayer check must run *before* the `shouldAttempt` gate, which
      // only fires `eth_fillTransaction` when the caller's `parameters`
      // option includes `'fees'` or `'gas'`. A caller who restricts
      // `parameters` to omit both (e.g. only wants `nonce`/`type` filled)
      // must still get a fee-payer signature -- sponsorship is independent
      // of which parameters the caller opted into filling.
      const nonce = await prepareTransactionRequest(client, {
        account,
        parameters: ['nonce'],
        to: '0x0000000000000000000000000000000000000000',
      }).then((request) => request.nonce)

      const receipt = await sendTransactionSync(client, {
        account,
        chainId: chain.id,
        feePayer: true,
        gas: 100_000n,
        maxFeePerGas: 10_000_000_000n,
        maxPriorityFeePerGas: 1_000_000_000n,
        nonce,
        parameters: ['nonce', 'type'],
        to: '0x0000000000000000000000000000000000000000',
      })

      expect(receipt.status).toBe('success')
      expect(receipt.feePayer).toBe(accounts[0].address.toLowerCase())
      expect(relayRequests).toContainEqual({
        method: 'eth_fillTransaction',
        params: expect.any(Array),
      })
    })

    test('behavior: sendTransaction still gets sponsored via feePayer: true when the caller restricts `parameters` to omit fees/gas on a minimal (unpopulated) envelope', async () => {
      const account = privateKeyToAccount(
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      // Same as above, but with no envelope fields pre-populated at all --
      // confirms the fix isn't accidentally coupled to "fields already set".
      // Uses `prepareTransactionRequest` directly (rather than a full send)
      // since restricting `parameters` to omit `'gas'`/`'fees'` on an
      // otherwise-empty envelope intentionally leaves the transaction
      // incomplete for broadcast -- what's under test is that the fill is
      // still *attempted* (this mock relay only attaches the fee-payer
      // signature at raw-transaction send time, not at fill time, so it
      // can't be asserted on the prepared result here).
      await prepareTransactionRequest(client, {
        account,
        feePayer: true,
        parameters: ['nonce', 'type'],
        to: '0x0000000000000000000000000000000000000000',
      })

      expect(relayRequests).toContainEqual({
        method: 'eth_fillTransaction',
        params: expect.any(Array),
      })
    })

    test('behavior: eth_fillTransaction with feePayer: true', async () => {
      await client.request({
        method: 'eth_fillTransaction',
        params: [
          {
            feePayer: true,
            to: '0x0000000000000000000000000000000000000000',
          },
        ],
      })

      expect(relayRequests).toHaveLength(1)
      expect(relayRequests).toContainEqual({
        method: 'eth_fillTransaction',
        params: [
          {
            feePayer: true,
            to: '0x0000000000000000000000000000000000000000',
          },
        ],
      })
    })

    test('behavior: eth_fillTransaction without feePayer preserves omission', async () => {
      await client.request({
        method: 'eth_fillTransaction',
        params: [{ to: '0x0000000000000000000000000000000000000000' }],
      })

      expect(relayRequests).toHaveLength(1)
      expect(relayRequests).toContainEqual({
        method: 'eth_fillTransaction',
        params: [
          {
            to: '0x0000000000000000000000000000000000000000',
          },
        ],
      })
    })

    test('behavior: eth_fillTransaction preserves explicit feePayer: null', async () => {
      await client.request({
        method: 'eth_fillTransaction',
        params: [
          {
            feePayer: null,
            to: '0x0000000000000000000000000000000000000000',
          },
        ],
      })

      expect(relayRequests).toHaveLength(1)
      expect(relayRequests).toContainEqual({
        method: 'eth_fillTransaction',
        params: [
          {
            feePayer: null,
            to: '0x0000000000000000000000000000000000000000',
          },
        ],
      })
    })

    test('behavior: eth_fillTransaction preserves explicit feePayer', async () => {
      await client.request({
        method: 'eth_fillTransaction',
        params: [
          {
            feePayer: accounts[0].address,
            to: '0x0000000000000000000000000000000000000000',
          },
        ],
      })

      expect(relayRequests).toHaveLength(1)
      expect(relayRequests).toContainEqual({
        method: 'eth_fillTransaction',
        params: [
          {
            feePayer: accounts[0].address,
            to: '0x0000000000000000000000000000000000000000',
          },
        ],
      })
    })

    test('behavior: sendTransactionSync with feePayer: true', async () => {
      const account = privateKeyToAccount(
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      const receipt = await sendTransactionSync(client, {
        account,
        feePayer: true,
        to: '0x0000000000000000000000000000000000000001',
      })

      expect(receipt.status).toBe('success')
      expect(relayRequests).toHaveLength(2)
      expect(relayRequests).toContainEqual({
        method: 'eth_fillTransaction',
        params: expect.any(Array),
      })
      expect(relayRequests).toContainEqual({
        method: 'eth_signRawTransaction',
        params: expect.any(Array),
      })
    })

    test.runIf(import.meta.env.VITE_TEMPO_MULTISIG)(
      'behavior: sendTransactionSync sponsors multisig with feePayer: true',
      async () => {
        const owner_1 = accounts[14]
        const owner_2 = accounts[15]
        const config = MultisigConfig.from({
          threshold: 2,
          owners: [
            { owner: owner_1.address, weight: 1 },
            { owner: owner_2.address, weight: 1 },
          ],
        })
        const account = Account.fromMultisig({ address: 'infer', ...config })

        const request = await prepareTransactionRequest(client, {
          account,
          feePayer: true,
          to: account.address,
          value: 0n,
        })
        const signatures = await Promise.all(
          [owner_1, owner_2].map((owner) =>
            signTransaction(client, { ...request, account: owner }),
          ),
        )
        const receipt = await sendTransactionSync(client, {
          ...request,
          account,
          feePayer: true,
          signatures,
        })

        expect(receipt.status).toBe('success')
        expect(receipt.from).toBe(account.address.toLowerCase())
        expect(receipt.feePayer).toBe(accounts[0].address.toLowerCase())
        expect(relayRequests).toContainEqual({
          method: 'eth_fillTransaction',
          params: expect.any(Array),
        })
        expect(relayRequests).toContainEqual({
          method: 'eth_signRawTransaction',
          params: expect.any(Array),
        })
      },
    )

    test.runIf(import.meta.env.VITE_TEMPO_MULTISIG)(
      'behavior: coordinated multisig accepts the relay transaction hash',
      async () => {
        const owner_1 = Account.fromSecp256k1(generatePrivateKey())
        const owner_2 = Account.fromSecp256k1(generatePrivateKey())
        const account = Account.fromMultisig({
          address: 'infer',
          owners: [owner_1, owner_2],
          threshold: 2,
        })
        const coordinated = getClient({
          transport: withMultisig(
            withRelay(http(), http('http://localhost:3051')),
            { store: Store.memory() },
          ),
        })

        const pending = await sendTransactionSync(coordinated, {
          account,
          calls: [{ data: '0xdeadbeef', to: accounts[20].address }],
          feePayer: true,
          owner: owner_1,
        })
        expect(pending.status).toMatchInlineSnapshot(`"pending"`)

        const receipt = await sendTransactionSync(coordinated, {
          account,
          hash: pending.transactionHash,
          owner: owner_2,
        })
        expect(receipt.status).toMatchInlineSnapshot(`"success"`)
        expect(receipt.from).toBe(account.address.toLowerCase())
        expect(receipt.feePayer).toBe(accounts[0].address.toLowerCase())

        const transaction = await getTransaction(coordinated, {
          hash: pending.transactionHash,
        })
        expect(transaction.multisig?.transactionHash).toBe(
          receipt.transactionHash,
        )
      },
    )

    test('behavior: non-sponsored transaction uses default transport', async () => {
      const receipt = await sendTransactionSync(client, {
        account: accounts[0],
        to: '0x0000000000000000000000000000000000000002',
      })

      expect(receipt.status).toBe('success')
      expect(relayRequests).toHaveLength(1)
      expect(relayRequests).toContainEqual({
        method: 'eth_fillTransaction',
        params: expect.any(Array),
      })
    })
  })

  describe('policy: sign-and-broadcast', () => {
    const client = getClient({
      transport: withRelay(http(), http('http://localhost:3051'), {
        policy: 'sign-and-broadcast',
      }),
    })

    test('behavior: sendTransaction with feePayer: true', async () => {
      const account = privateKeyToAccount(
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      await sendTransaction(client, {
        account,
        feePayer: true,
        to: '0x0000000000000000000000000000000000000000',
      })

      expect(relayRequests).toHaveLength(2)
      expect(relayRequests).toContainEqual({
        method: 'eth_fillTransaction',
        params: expect.any(Array),
      })
      expect(relayRequests).toContainEqual({
        method: 'eth_sendRawTransaction',
        params: expect.any(Array),
      })
    })

    test('behavior: sendTransactionSync with feePayer: true', async () => {
      const account = privateKeyToAccount(
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      const receipt = await sendTransactionSync(client, {
        account,
        feePayer: true,
        to: '0x0000000000000000000000000000000000000000',
      })

      expect(receipt.status).toBe('success')
      expect(relayRequests).toHaveLength(2)
      expect(relayRequests).toContainEqual({
        method: 'eth_fillTransaction',
        params: expect.any(Array),
      })
      expect(relayRequests).toContainEqual({
        method: 'eth_sendRawTransactionSync',
        params: expect.any(Array),
      })
    })
  })

  describe('withFeePayer', () => {
    const client = getClient({
      transport: withFeePayer(http(), http('http://localhost:3051')),
    })

    test('behavior: backwards compatible alias', async () => {
      const account = privateKeyToAccount(
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      const receipt = await sendTransactionSync(client, {
        account,
        feePayer: true,
        to: '0x0000000000000000000000000000000000000003',
      })

      expect(receipt.status).toBe('success')
      expect(relayRequests).toHaveLength(2)
      expect(relayRequests).toContainEqual({
        method: 'eth_fillTransaction',
        params: expect.any(Array),
      })
      expect(relayRequests).toContainEqual({
        method: 'eth_signRawTransaction',
        params: expect.any(Array),
      })
    })
  })
})

describe('walletNamespaceCompat', () => {
  const client = getClient({
    transport: walletNamespaceCompat(http(), {
      account: accounts[0],
    }),
  })

  describe('wallet_sendCalls', () => {
    test('default', async () => {
      const result = await sendCallsSync(client, {
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      })

      expect(result.id).toBeDefined()
      expect(result.id.startsWith('0x')).toBe(true)
    })

    test('with sync capability', async () => {
      const result = await sendCallsSync(client, {
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        capabilities: { sync: true },
      })

      expect(result.id).toBeDefined()
    })

    test('with value', async () => {
      const result = await sendCallsSync(client, {
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: 0n,
          },
        ],
      })

      expect(result.id).toBeDefined()
    })

    test('error: no chainId', async () => {
      await expect(
        client.request({
          method: 'wallet_sendCalls',
          params: [{ atomicRequired: false, calls: [], version: '2.0.0' }],
        }),
      ).rejects.toThrow()
    })

    test('error: wrong chainId', async () => {
      await expect(
        client.request({
          method: 'wallet_sendCalls',
          params: [
            {
              atomicRequired: false,
              chainId: '0x999',
              calls: [],
              version: '2.0.0',
            },
          ],
        }),
      ).rejects.toThrow()
    })

    test('error: from address mismatch', async () => {
      await expect(
        client.request({
          method: 'wallet_sendCalls',
          params: [
            {
              atomicRequired: false,
              chainId: Hex.fromNumber(chain.id),
              from: '0x0000000000000000000000000000000000000001',
              calls: [],
              version: '2.0.0',
            },
          ],
        }),
      ).rejects.toThrow()
    })

    test('error: with empty params', async () => {
      await expect(
        client.request({
          method: 'wallet_sendCalls',
          params: [],
        } as never),
      ).rejects.toThrow()
    })

    test('error: with data', async () => {
      const result = await sendCallsSync(client, {
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            data: '0xdeadbeef',
          },
        ],
      })

      expect(result.id).toBeDefined()
    })
  })

  describe('wallet_getCallsStatus', () => {
    test('default', async () => {
      const { id } = await sendCallsSync(client, {
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        capabilities: { sync: true },
      })

      const status = await getCallsStatus(client, { id })

      expect(status.status).toBeDefined()
      expect(status.atomic).toBe(true)
      expect(status.receipts).toBeDefined()
      expect(status.receipts?.length).toBe(1)
    })

    test('error: no id', async () => {
      await expect(
        client.request({
          method: 'wallet_getCallsStatus',
          params: [],
        } as never),
      ).rejects.toThrow('`id` not found')
    })

    test('error: unsupported id format', async () => {
      await expect(
        client.request({
          method: 'wallet_getCallsStatus',
          params: ['0x1234'],
        }),
      ).rejects.toThrow('`id` not supported')
    })

    test('error: no params', async () => {
      await expect(
        client.request({
          method: 'wallet_getCallsStatus',
        } as never),
      ).rejects.toThrow('`id` not found')
    })
  })

  test('passthrough for other methods', async () => {
    const blockNumber = await client.request({
      method: 'eth_blockNumber',
    })
    expect(blockNumber).toBeDefined()
  })
})
