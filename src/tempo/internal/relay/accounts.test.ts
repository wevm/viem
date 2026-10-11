import { createRequestListener } from '@remix-run/node-fetch-server'
import {
  AccountConfig,
  AccountOperation,
  KeyAuthorization,
  SignatureEnvelope,
} from 'ox/tempo'
import {
  createClient,
  createClientResolver,
  http,
  parseUnits,
  toHex,
} from 'viem'
import { sendTransactionSync } from 'viem/actions'
import { tempo, tempoModerato } from 'viem/chains'
import {
  Account,
  Actions,
  Relay,
  Store,
  Transaction,
  withRelay,
} from 'viem/tempo'
import { beforeAll, describe, expect, onTestFinished, test } from 'vitest'
import * as Tempo from '~test/tempo/config.js'
import { createHttpServer } from '~test/utils.js'
import { nativeMultisigFactory } from '../../Addresses.js'
import * as Operation from '../../accounts/Operation.js'
import { parseApproval } from '../../accounts/Signature.js'

const feePayerAccount = Tempo.accounts[0]!
const recipient = Tempo.accounts[7]!
const caller = Tempo.getClient({ chain: Tempo.chain })

const owner = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)
const config = AccountConfig.from({
  owners: [{ owner: owner.address, weight: 1 }],
  threshold: 1,
})
const account = AccountConfig.getAddress(config, {
  factory: nativeMultisigFactory,
})
const approval = SignatureEnvelope.from({
  signature: { r: 1n, s: 2n, yParity: 0 },
  type: 'secp256k1',
})
const serializedApproval = SignatureEnvelope.serialize(approval)

test('behavior: resolves the chain from a Tempo transaction', async () => {
  const handle = Relay.handleRequest(
    async (_request, options) => options?.chainId,
    { plugins: [Relay.accounts({ store: Store.memory() })] },
  )
  const transaction = await Transaction.serialize({
    calls: [],
    chainId: 4217,
  })

  await expect(
    handle({
      method: 'eth_sendRawTransaction',
      params: [transaction],
    }),
  ).resolves.toMatchInlineSnapshot(`4217`)
})

test('behavior: resolves the chain from a key authorization', async () => {
  const handle = Relay.handleRequest(
    async (request, options) => {
      throw new Error(`${request.method}:${options?.chainId}`)
    },
    { plugins: [Relay.accounts({ store: Store.memory() })] },
  )
  const keyAuthorization = KeyAuthorization.from(
    {
      account,
      address: '0x2222222222222222222222222222222222222222',
      chainId: 4217n,
      isAdmin: false,
      type: 'secp256k1',
    },
    {
      signature: SignatureEnvelope.from({
        account,
        config,
        signatures: [parseApproval(SignatureEnvelope.serialize(approval))],
      }),
    },
  )

  await expect(
    handle({
      method: 'account_approveKeyAuthorization',
      params: [{ keyAuthorization: KeyAuthorization.toRpc(keyAuthorization) }],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [UnknownRpcError: An unknown RPC error occurred.

    Details: eth_blockNumber:4217
    Version: viem@x.y.z]
  `)
})

test('behavior: resolves the chain from a stored transaction operation', async () => {
  const store = Store.memory()
  const transaction = await Transaction.serialize({ calls: [], chainId: 4217 })
  const hash = AccountOperation.getHash({
    account,
    config,
    transaction,
    type: 'transaction',
  })
  const validApproval = SignatureEnvelope.serialize(
    SignatureEnvelope.from(await owner.sign({ hash })),
  )
  await Operation.update(store, hash, () =>
    AccountOperation.from({
      account,
      approvals: [validApproval],
      config,
      createdAt: 1,
      hash,
      signatureCount: 1,
      status: 'success',
      threshold: 1,
      transaction,
      transactionHash: `0x${'22'.repeat(32)}`,
      type: 'transaction',
      updatedAt: 2,
      weight: 1,
    }),
  )
  const handle = Relay.handleRequest(
    async (_request, options) => options?.chainId,
    { plugins: [Relay.accounts({ store })] },
  )

  await expect(
    handle({ method: 'eth_getTransactionReceipt', params: [hash] }),
  ).resolves.toMatchInlineSnapshot(`4217`)
})

test('behavior: resolves the chain from a stored key authorization operation', async () => {
  const store = Store.memory()
  const keyAuthorization = KeyAuthorization.serialize(
    KeyAuthorization.from({
      account,
      address: '0x2222222222222222222222222222222222222222',
      chainId: 4217n,
      isAdmin: false,
      type: 'secp256k1',
    }),
  )
  const hash = AccountOperation.getHash({
    account,
    config,
    keyAuthorization,
    type: 'keyAuthorization',
  })
  await Operation.update(store, hash, () =>
    AccountOperation.from({
      account,
      approvals: [],
      config,
      createdAt: 1,
      hash,
      keyAuthorization,
      signatureCount: 0,
      status: 'pending',
      threshold: 1,
      type: 'keyAuthorization',
      updatedAt: 2,
      weight: 0,
    }),
  )
  const handle = Relay.handleRequest(
    async (request, options) => {
      throw new Error(`${request.method}:${options?.chainId}`)
    },
    { plugins: [Relay.accounts({ store })] },
  )

  await expect(
    handle({
      method: 'account_approveKeyAuthorization',
      params: [{ hash, signature: serializedApproval }],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [UnknownRpcError: An unknown RPC error occurred.

    Details: eth_blockNumber:4217
    Version: viem@x.y.z]
  `)
})

test('error: rejects conflicting chain ids', async () => {
  const handle = Relay.handleRequest(async () => null, {
    plugins: [Relay.accounts({ store: Store.memory() })],
  })
  const transaction = await Transaction.serialize({
    calls: [],
    chainId: 4217,
  })

  await expect(
    handle(
      {
        method: 'eth_sendRawTransaction',
        params: [transaction],
      },
      { chainId: 1 },
    ),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InvalidParamsError: Conflicting chain ids.]`,
  )
})

test('accounts plugin infers the chain before client resolution', async () => {
  const resolver = createClientResolver({
    chains: [tempo, tempoModerato],
    transport: () => http(),
  })
  const relay = Relay.create({
    getClient: resolver.getClient,
    plugins: [Relay.accounts({ store: Store.memory() })],
  })
  const transaction = await Transaction.serialize({ calls: [], chainId: 1 })
  await expect(
    relay.request({ method: 'eth_sendRawTransaction', params: [transaction] }),
  ).rejects.toThrow('Chain with id 1 is not configured')
})

test('rejects a signed payload conflicting with the client chain', async () => {
  const relay = Relay.create({
    client: caller,
    plugins: [Relay.accounts({ store: Store.memory() })],
  })
  const transaction = await Transaction.serialize({ calls: [], chainId: 1 })
  await expect(
    relay.request({ method: 'eth_sendRawTransaction', params: [transaction] }),
  ).rejects.toThrow('Conflicting chain ids')
})

describe.runIf(
  import.meta.env.VITE_TEMPO_ACCOUNTS === 'true' &&
    import.meta.env.VITE_TEMPO_TAG === 'sha-83f3ccd',
)('plugin: accounts', () => {
  beforeAll(async () => {
    await Actions.faucet.fundSync(caller, {
      account: feePayerAccount,
      timeout: 60_000,
    })
  })

  test.each([false, true])(
    'collects approvals with fee sponsorship: %s',
    async (sponsored) => {
      const owners = [Tempo.accounts[1]!, Tempo.accounts[2]!]
      const account = Account.fromConfig({
        owners,
        salt: toHex(sponsored ? 0x514001 : 0x514000, { size: 32 }),
        threshold: 2,
      })
      await Actions.token.transferSync(caller, {
        account: feePayerAccount,
        token: Tempo.addresses.alphaUsd,
        to: account.address,
        amount: 100_000n,
      })
      const client = createClient({
        chain: Tempo.chain,
        pollingInterval: 100,
        transport: withRelay(Tempo.http(), {
          plugins: [
            Relay.accounts({ store: Store.memory() }),
            ...(sponsored
              ? [Relay.feePayer({ account: feePayerAccount })]
              : []),
          ],
        }),
      })
      const before = await Actions.token.getBalance(caller, {
        account: recipient.address,
        token: Tempo.addresses.alphaUsd,
      })
      const { receipt: pending } = await Actions.token.transferSync(client, {
        account,
        owner: owners[0]!,
        token: Tempo.addresses.alphaUsd,
        feeToken: Tempo.addresses.alphaUsd,
        feePayer: sponsored || undefined,
        to: recipient.address,
        amount: 1n,
      })
      expect(pending.status).toBe('pending')
      expect(pending.operation?.signatureCount).toBe(1)
      expect(
        await Actions.token.getBalance(caller, {
          account: recipient.address,
          token: Tempo.addresses.alphaUsd,
        }),
      ).toEqual(before)
      const { receipt } = await Actions.token.transferSync(client, {
        account,
        owner: owners[1]!,
        hash: pending.transactionHash,
        token: Tempo.addresses.alphaUsd,
        to: recipient.address,
        amount: 1n,
      } as never)
      expect(receipt.status).toBe('success')
      expect(receipt.operation?.signatureCount).toBe(2)
      expect(receipt.feePayer).toBe(
        (sponsored ? feePayerAccount.address : account.address).toLowerCase(),
      )
      expect(
        (
          await Actions.token.getBalance(caller, {
            account: recipient.address,
            token: Tempo.addresses.alphaUsd,
          })
        ).amount - before.amount,
      ).toBe(1n)
    },
  )

  test('plain HTTP transport: collects approvals and broadcasts at quorum', async () => {
    const relay = Relay.create({
      client: caller,
      plugins: [Relay.accounts({ store: Store.memory() })],
    })

    const server = await createHttpServer(createRequestListener(relay.fetch))
    onTestFinished(async () => {
      await server.close()
    })

    const client = Tempo.getClient({
      chain: Tempo.chain,
      transport: http(server.url),
    })

    const owner_1 = Tempo.accounts[1]!
    const owner_2 = Tempo.accounts[2]!
    const account = Account.fromConfig({
      address: 'infer',
      owners: [owner_1.address, owner_2.address],
      salt: toHex(0x109701, { size: 32 }),
      threshold: 2,
    })

    const token = Tempo.addresses.alphaUsd

    await Actions.token.transferSync(caller, {
      account: feePayerAccount,
      token,
      to: account.address,
      amount: parseUnits('1', 6),
    })

    const balance = await Actions.token.getBalance(client, {
      account: recipient.address,
      token,
    })

    const pending = await sendTransactionSync(client, {
      account,
      owner: owner_1,
      feeToken: token,
      calls: [
        Actions.token.transfer.call(client, {
          token,
          to: recipient.address,
          amount: 1n,
        }),
      ],
    })

    expect(pending.status).toMatchInlineSnapshot(`"pending"`)
    expect(pending.operation).toMatchObject({
      signatureCount: 1,
      threshold: 2,
      weight: 1,
    })

    expect(
      (
        await Actions.token.getBalance(client, {
          account: recipient.address,
          token,
        })
      ).amount,
    ).toBe(balance.amount)

    const receipt = await sendTransactionSync(client, {
      account,
      hash: pending.transactionHash,
      owner: owner_2,
    })

    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(receipt.operation).toMatchObject({
      signatureCount: 2,
      threshold: 2,
      weight: 2,
    })

    expect(
      (
        await Actions.token.getBalance(client, {
          account: recipient.address,
          token,
        })
      ).amount - balance.amount,
    ).toMatchInlineSnapshot(`1n`)

    expect(
      await Actions.accounts.getOperation(client, {
        hash: pending.transactionHash,
      }),
    ).toMatchObject({ status: 'success' })
  })
})
