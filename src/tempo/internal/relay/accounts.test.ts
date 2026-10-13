import type { TransactionReceipt as TempoReceipt_ } from '../../chainConfig.js'
import { http as tempoHttp_ } from 'viem/tempo'
import { Client as CoreClient_ } from 'viem'
import { from as parseUnits } from 'ox/Value'
import { fromNumber as toHex } from 'ox/Hex'
import { Actions as CoreActions_ } from 'viem'
import * as Transaction from 'ox/tempo/TxEnvelopeTempo'
import { tempoLocalnet as chain_ } from 'viem/chains'
import { Account as TempoAccount_ } from 'viem/tempo'
import { createRequestListener } from '@remix-run/node-fetch-server'
import {
  AccountConfig,
  AccountOperation,
  KeyAuthorization,
  SignatureEnvelope,
} from 'ox/tempo'
import { Secp256k1 } from 'ox'
import { http } from 'viem'

import { tempo, tempoModerato } from 'viem/chains'
import { Account, Actions, Relay, Store, withRelay } from 'viem/tempo'
import { beforeAll, describe, expect, onTestFinished, test } from 'vitest'
import * as Tempo from '~test/tempo.js'
import { createServer as createHttpServer } from '~test/http.js'
import { nativeMultisigFactory } from '../../Addresses.js'
import * as Operation from '../../accounts/Operation.js'
import { parseApproval } from '../../accounts/Signature.js'

const feePayerAccount = TempoAccount_.fromSecp256k1(
  Tempo.accounts[0]!.privateKey,
)
const recipient = TempoAccount_.fromSecp256k1(Tempo.accounts[7]!.privateKey)
const caller = Tempo.getClient({})

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
  signature: {
    r: `0x${'00'.repeat(31)}01`,
    s: `0x${'00'.repeat(31)}02`,
    yParity: 0,
  },
  type: 'secp256k1',
})
const serializedApproval = SignatureEnvelope.serialize(approval)

test('behavior: resolves the chain from a Tempo transaction', async () => {
  const handle = Relay.handleRequest(
    async (_request, options) => options?.chainId,
    { plugins: [Relay.accounts({ store: Store.memory() })] },
  )
  const transaction = await Transaction.serialize({
    calls: [{ to: recipient.address }],
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
  ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: eth_blockNumber:4217]`)
})

test('behavior: resolves the chain from a stored transaction operation', async () => {
  const store = Store.memory()
  const transaction = await Transaction.serialize({
    calls: [{ to: recipient.address }],
    chainId: 4217,
  })
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
  ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: eth_blockNumber:4217]`)
})

test('error: rejects conflicting chain ids', async () => {
  const handle = Relay.handleRequest(async () => null, {
    plugins: [Relay.accounts({ store: Store.memory() })],
  })
  const transaction = await Transaction.serialize({
    calls: [{ to: recipient.address }],
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
  const resolver = CoreClient_.createResolver({
    chains: [tempo, tempoModerato],
    transport: () => http(),
  })
  const relay = Relay.create({
    getClient: resolver.getClient,
    plugins: [Relay.accounts({ store: Store.memory() })],
  })
  const transaction = await Transaction.serialize({
    calls: [{ to: recipient.address }],
    chainId: 1,
  })
  await expect(
    relay.request({ method: 'eth_sendRawTransaction', params: [transaction] }),
  ).rejects.toThrow('Chain with id 1 is not configured')
})

test('rejects a signed payload conflicting with the client chain', async () => {
  const relay = Relay.create({
    client: caller,
    plugins: [Relay.accounts({ store: Store.memory() })],
  })
  const transaction = await Transaction.serialize({
    calls: [{ to: recipient.address }],
    chainId: 1,
  })
  await expect(
    relay.request({ method: 'eth_sendRawTransaction', params: [transaction] }),
  ).rejects.toThrow('Conflicting chain ids')
})

describe.runIf(
  process.env.VITE_TEMPO_ACCOUNTS === 'true' &&
    process.env.VITE_TEMPO_TAG === 'sha-83f3ccd',
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
      const owners = [
        TempoAccount_.fromSecp256k1(Tempo.accounts[1]!.privateKey),
        TempoAccount_.fromSecp256k1(Tempo.accounts[2]!.privateKey),
      ]
      const account = Account.fromConfig({
        owners,
        salt: toHex(sponsored ? 0x514001 : 0x514000, { size: 32 }),
        threshold: 2,
      })
      await Actions.token.transferSync(caller, {
        account: feePayerAccount,
        token: Tempo.alphaUsd,
        to: account.address,
        amount: 100_000n,
      })
      const client = CoreClient_.create({
        chain: chain_,
        pollingInterval: 100,
        transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
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
        token: Tempo.alphaUsd,
      })
      const { receipt: pending } = await Actions.token.transferSync(client, {
        account,
        owner: owners[0]!,
        token: Tempo.alphaUsd,
        feeToken: Tempo.alphaUsd,
        feePayer: sponsored || undefined,
        to: recipient.address,
        amount: 1n,
      })
      expect(pending.status).toBe('pending')
      expect((pending as TempoReceipt_).operation?.signatureCount).toBe(1)
      expect(
        await Actions.token.getBalance(caller, {
          account: recipient.address,
          token: Tempo.alphaUsd,
        }),
      ).toEqual(before)
      const { receipt } = await Actions.token.transferSync(client, {
        account,
        owner: owners[1]!,
        hash: pending.transactionHash,
        token: Tempo.alphaUsd,
        to: recipient.address,
        amount: 1n,
      } as never)
      expect(receipt.status).toBe('success')
      expect((receipt as TempoReceipt_).operation?.signatureCount).toBe(2)
      expect((receipt as TempoReceipt_).feePayer).toBe(
        (sponsored ? feePayerAccount.address : account.address).toLowerCase(),
      )
      expect(
        (
          await Actions.token.getBalance(caller, {
            account: recipient.address,
            token: Tempo.alphaUsd,
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
      transport: http(server.url),
    })

    const owner_1 = TempoAccount_.fromSecp256k1(Tempo.accounts[1]!.privateKey)
    const owner_2 = TempoAccount_.fromSecp256k1(Tempo.accounts[2]!.privateKey)
    const account = Account.fromConfig({
      address: 'infer',
      owners: [owner_1.address, owner_2.address],
      salt: toHex(0x109701, { size: 32 }),
      threshold: 2,
    })

    const token = Tempo.alphaUsd

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

    const pending = await CoreActions_.transaction.sendSync(client, {
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
    expect((pending as TempoReceipt_).operation).toMatchObject({
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

    const receipt = await CoreActions_.transaction.sendSync(client, {
      account,
      hash: pending.transactionHash,
      owner: owner_2,
    })

    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect((receipt as TempoReceipt_).operation).toMatchObject({
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

test('plugin: keyAuthorization rejects a configurable account key authorization for another account', async () => {
  const relay = Relay.create({
    client: caller,
    plugins: [
      Relay.keyAuthorization(),
      Relay.accounts({ store: Store.memory() }),
    ],
  })
  const keyAuthorization = KeyAuthorization.from(
    {
      account: recipient.address,
      address: '0x2222222222222222222222222222222222222222',
      chainId: BigInt(chain_.id),
      type: 'secp256k1',
    },
    {
      signature: SignatureEnvelope.from({
        account,
        config,
        signatures: [parseApproval(serializedApproval)],
      }),
    },
  )

  await expect(
    relay.request({
      method: 'relay_saveKeyAuthorization',
      params: [KeyAuthorization.toRpc(keyAuthorization)],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InvalidParamsError: Configurable account key authorization account does not match its signature.]`,
  )
})

describe.runIf(
  process.env.VITE_TEMPO_ACCOUNTS === 'true' &&
    process.env.VITE_TEMPO_TAG === 'sha-83f3ccd',
)('plugin: keyAuthorization', () => {
  const relay = Relay.create({
    client: caller,
    plugins: [
      Relay.keyAuthorization(),
      Relay.accounts({ store: Store.memory() }),
    ],
  })

  function getClient(options: Relay.keyAuthorization.Options = {}) {
    return CoreClient_.create({
      chain: chain_,
      pollingInterval: 100,
      transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
        plugins: [
          Relay.keyAuthorization(options),
          Relay.accounts({ store: Store.memory() }),
        ],
      }),
    })
  }

  function getOwners(...indices: readonly number[]) {
    return indices.map((index) =>
      TempoAccount_.fromSecp256k1(Tempo.accounts[index]!.privateKey),
    )
  }

  beforeAll(async () => {
    await Actions.faucet.fundSync(caller, {
      account: feePayerAccount,
      timeout: 60_000,
    })
  })

  test('behavior: attaches a coordinated key authorization at quorum', async () => {
    const owners = getOwners(10, 11)
    const account = Account.fromConfig({
      address: 'infer',
      owners,
      salt: toHex(0x514100, { size: 32 }),
      threshold: 2,
    })
    const accessKey = TempoAccount_.fromSecp256k1(
      Secp256k1.randomPrivateKey(),
      {
        access: account,
      },
    )
    await Actions.token.transferSync(caller, {
      account: feePayerAccount,
      token: Tempo.alphaUsd,
      to: account.address,
      amount: 100_000n,
    })
    const client = getClient()

    const pending = await Actions.accessKey.signAuthorization(client, {
      accessKey,
      account,
      owner: owners[0]!,
    })

    expect(pending.status).toMatchInlineSnapshot(`"pending"`)

    await Actions.accessKey.signAuthorization(client, {
      hash: pending.hash,
      owner: owners[1]!,
    })
    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: 1n,
      feeToken: Tempo.alphaUsd,
      to: recipient.address,
      token: Tempo.alphaUsd,
    })
    const operation = await Actions.accounts.getOperation(client, {
      hash: pending.hash,
    })

    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(operation?.status).toMatchInlineSnapshot(`"success"`)
  })

  test('behavior: skips a coordinated key authorization that expired before quorum', async () => {
    const owners = getOwners(16, 17)
    const account = Account.fromConfig({
      address: 'infer',
      owners,
      salt: toHex(0x514103, { size: 32 }),
      threshold: 2,
    })
    const accessKey = TempoAccount_.fromSecp256k1(
      Secp256k1.randomPrivateKey(),
      {
        access: account,
      },
    )
    const client = getClient()

    const pending = await Actions.accessKey.signAuthorization(client, {
      accessKey,
      account,
      expiry: Math.floor(Date.now() / 1000) + 2,
      owner: owners[0]!,
    })
    await new Promise((resolve) => setTimeout(resolve, 2_000))
    const success = await Actions.accessKey.signAuthorization(client, {
      hash: pending.hash,
      owner: owners[1]!,
    })

    expect(success.status).toMatchInlineSnapshot(`"success"`)
    await expect(
      CoreActions_.transaction.prepare(client, {
        account: accessKey,
        feeToken: Tempo.alphaUsd,
        to: recipient.address,
      }),
    ).rejects.toThrow('KeyNotFound')
  })

  test('behavior: discards a pending key authorization after a config rotation', async () => {
    const [owner] = getOwners(18)
    const account = Account.fromConfig({
      address: 'infer',
      owners: [owner!],
      salt: toHex(0x514104, { size: 32 }),
    })
    const accessKey = TempoAccount_.fromSecp256k1(
      Secp256k1.randomPrivateKey(),
      {
        access: account,
      },
    )
    const store = Store.memory()
    const client = getClient({ store })
    const key = [
      'keyAuthorization',
      chain_.id,
      account.address.toLowerCase(),
      accessKey.accessKeyAddress.toLowerCase(),
    ].join(':')
    await Actions.token.transferSync(caller, {
      account: feePayerAccount,
      token: Tempo.alphaUsd,
      to: account.address,
      amount: 100_000n,
    })
    await Actions.token.transferSync(caller, {
      account,
      amount: 1n,
      feeToken: Tempo.alphaUsd,
      to: recipient.address,
      token: Tempo.alphaUsd,
    })

    await Actions.accessKey.signAuthorization(client, { account, accessKey })

    expect(await store.getItem(key)).toBeTruthy()

    await Actions.accounts.updateConfigSync(caller, {
      account,
      currentConfig: account.config,
      feeToken: Tempo.alphaUsd,
      nextConfig: {
        owners: [
          { owner: owner!.address, weight: 1 },
          { owner: recipient.address, weight: 1 },
        ],
        threshold: 1,
      },
    })

    await expect(
      CoreActions_.transaction.prepare(client, {
        account: accessKey,
        feeToken: Tempo.alphaUsd,
        to: recipient.address,
      }),
    ).rejects.toThrow('KeyNotFound')
    expect(await store.getItem(key)).toBeNull()
  })

  test('behavior: attaches a key authorization signed by external owners', async () => {
    const owners = getOwners(13, 14)
    const account = Account.fromConfig({
      address: 'infer',
      owners: owners.map((owner) => owner.address),
      salt: toHex(0x514101, { size: 32 }),
      threshold: 2,
    })
    const accessKey = TempoAccount_.fromSecp256k1(
      Secp256k1.randomPrivateKey(),
      {
        access: account,
      },
    )
    await Actions.token.transferSync(caller, {
      account: feePayerAccount,
      token: Tempo.alphaUsd,
      to: account.address,
      amount: 100_000n,
    })
    const client = getClient()

    const authorization = await Actions.accessKey.prepareAuthorization(client, {
      account,
      accessKey,
    })
    const signatures = await Promise.all(
      owners.map((owner) => owner.sign({ hash: authorization.signPayload })),
    )
    await Actions.accessKey.signAuthorization(client, {
      ...authorization,
      signatures,
    })
    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: 1n,
      feeToken: Tempo.alphaUsd,
      to: recipient.address,
      token: Tempo.alphaUsd,
    })

    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })

  test('error: rejects a configurable account key authorization below quorum', async () => {
    const owners = getOwners(13, 14)
    const account = Account.fromConfig({
      address: 'infer',
      owners: owners.map((owner) => owner.address),
      salt: toHex(0x514102, { size: 32 }),
      threshold: 2,
    })
    const accessKey = TempoAccount_.fromSecp256k1(
      Secp256k1.randomPrivateKey(),
      {
        access: account,
      },
    )
    const authorization = await Actions.accessKey.prepareAuthorization(caller, {
      account,
      accessKey,
    })
    const keyAuthorization = KeyAuthorization.from(
      {
        account: account.address,
        address: accessKey.accessKeyAddress,
        chainId: BigInt(chain_.id),
        type: 'secp256k1',
      },
      {
        signature: SignatureEnvelope.from({
          account: account.address,
          config: account.config,
          signatures: [
            parseApproval(
              await owners[0]!.sign({ hash: authorization.signPayload }),
            ),
          ],
        }),
      },
    )

    await expect(
      relay.request({
        method: 'relay_saveKeyAuthorization',
        params: [KeyAuthorization.toRpc(keyAuthorization)],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Configurable account key authorization has not reached quorum.]`,
    )
  })
})
