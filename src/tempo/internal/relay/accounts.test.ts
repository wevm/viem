import { createRequestListener } from '@remix-run/node-fetch-server'
import {
  AccountConfig,
  AccountOperation,
  KeyAuthorization,
  SignatureEnvelope,
} from 'ox/tempo'
import {
  type Address,
  createClient,
  createClientResolver,
  custom,
  http,
  isAddressEqual,
  parseUnits,
  toHex,
} from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import {
  fillTransaction,
  getBlock,
  getTransaction,
  sendTransactionSync,
} from 'viem/actions'
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
const account = AccountConfig.getAddress(config)
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

test('error: requires a chain to read a config', async () => {
  const handle = Relay.handleRequest(async () => null, {
    plugins: [Relay.accounts({ store: Store.memory() })],
  })

  await expect(
    handle({ method: 'account_getConfig', params: [{ address: account }] }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InvalidParamsError: A chain ID is required to resolve the downstream client.]`,
  )
})

test('error: requires a chain to approve a key authorization for any chain', async () => {
  const handle = Relay.handleRequest(async () => null, {
    plugins: [Relay.accounts({ store: Store.memory() })],
  })
  const keyAuthorization = KeyAuthorization.from(
    {
      account,
      address: '0x2222222222222222222222222222222222222222',
      chainId: 0n,
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
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InvalidParamsError: A chain ID is required to resolve the downstream client.]`,
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

describe.runIf(Tempo.configurableAccounts)('plugin: accounts', () => {
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

  test('behavior: serves a pending config only on its chain', async () => {
    const store = Store.memory()
    const relay = Relay.create({
      client: caller,
      plugins: [Relay.accounts({ store })],
    })
    const other = Relay.create({
      client: Tempo.getClient({
        chain: { ...Tempo.chain, id: Tempo.chain.id + 1 },
      }),
      plugins: [Relay.accounts({ store })],
    })
    const client = Tempo.getClient({
      chain: Tempo.chain,
      transport: custom(relay),
    })
    const owner_1 = Tempo.accounts[1]!
    const owner_2 = Tempo.accounts[2]!
    const account = Account.fromConfig({
      address: 'infer',
      owners: [owner_1.address, owner_2.address],
      salt: toHex(0x109702, { size: 32 }),
      threshold: 2,
    })
    const token = Tempo.addresses.alphaUsd
    await Actions.token.transferSync(caller, {
      account: feePayerAccount,
      token,
      to: account.address,
      amount: parseUnits('1', 6),
    })

    await sendTransactionSync(client, {
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

    expect([
      await Actions.accounts.getConfig(client, { address: account.address }),
      await Actions.accounts.getConfig(
        Tempo.getClient({
          chain: { ...Tempo.chain, id: Tempo.chain.id + 1 },
          transport: custom(other),
        }),
        { address: account.address },
      ),
    ]).toMatchInlineSnapshot(`
      [
        {
          "owners": [
            {
              "owner": "0x8c8d35429f74ec245f8ef2f4fd1e551cff97d650",
              "weight": 1,
            },
            {
              "owner": "0x98e503f35d0a019cb0a251ad243a4ccfcf371f46",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000109702",
          "threshold": 2,
          "version": 0n,
        },
        null,
      ]
    `)
  })

  test('behavior: stores a config from resolveConfig', async () => {
    const store = Store.memory()
    const config = AccountConfig.from({
      owners: [{ owner: Tempo.accounts[3]!.address, weight: 1 }],
      salt: toHex(0x109703, { size: 32 }),
      threshold: 1,
    })
    const address = AccountConfig.getAddress(config)
    const resolving = Tempo.getClient({
      chain: Tempo.chain,
      transport: custom(
        Relay.create({
          client: caller,
          plugins: [
            Relay.accounts({
              resolveConfig: (options) =>
                options.chainId === Tempo.chain.id &&
                isAddressEqual(options.address, address) &&
                options.commitment === toHex(0, { size: 32 })
                  ? config
                  : null,
              store,
            }),
          ],
        }),
      ),
    })
    const stored = Tempo.getClient({
      chain: Tempo.chain,
      transport: custom(
        Relay.create({
          client: caller,
          plugins: [Relay.accounts({ store })],
        }),
      ),
    })

    expect([
      await Actions.accounts.getConfig(resolving, { address }),
      await Actions.accounts.getConfig(stored, { address }),
    ]).toMatchInlineSnapshot(`
      [
        {
          "owners": [
            {
              "owner": "0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000109703",
          "threshold": 1,
          "version": 0n,
        },
        {
          "owners": [
            {
              "owner": "0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000109703",
          "threshold": 1,
          "version": 0n,
        },
      ]
    `)
  })

  test('error: propagates a store failure while saving a resolved config', async () => {
    const config = AccountConfig.from({
      owners: [{ owner: Tempo.accounts[6]!.address, weight: 1 }],
      threshold: 1,
    })
    const address = AccountConfig.getAddress(config)
    const store = Store.from({
      compareAndSet() {
        throw new Error('Store unavailable.')
      },
      getItem() {
        return null
      },
      removeItem() {},
      setItem() {},
    })
    const client = Tempo.getClient({
      chain: Tempo.chain,
      transport: custom(
        Relay.create({
          client: caller,
          plugins: [Relay.accounts({ resolveConfig: () => config, store })],
        }),
      ),
    })

    await expect(
      Actions.accounts.getConfig(client, { address }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UnknownRpcError: An unknown RPC error occurred.

      Details: Store unavailable.
      Version: viem@x.y.z]
    `)
  })

  test('behavior: drops a resolved config for another account', async () => {
    const store = Store.memory()
    const config = AccountConfig.from({
      owners: [{ owner: Tempo.accounts[4]!.address, weight: 1 }],
      threshold: 1,
    })
    const address = AccountConfig.getAddress(
      AccountConfig.from({
        owners: [{ owner: Tempo.accounts[5]!.address, weight: 1 }],
        threshold: 1,
      }),
    )
    const resolving = Tempo.getClient({
      chain: Tempo.chain,
      transport: custom(
        Relay.create({
          client: caller,
          plugins: [Relay.accounts({ resolveConfig: () => config, store })],
        }),
      ),
    })
    const stored = Tempo.getClient({
      chain: Tempo.chain,
      transport: custom(
        Relay.create({
          client: caller,
          plugins: [Relay.accounts({ store })],
        }),
      ),
    })

    expect([
      await Actions.accounts.getConfig(resolving, { address }),
      await Actions.accounts.getConfig(stored, { address }),
    ]).toMatchInlineSnapshot(`
      [
        null,
        null,
      ]
    `)
  })
})

describe.runIf(Tempo.configurableAccounts)('plugin: keyAuthorization', () => {
  const relay = Relay.create({
    client: caller,
    plugins: [
      Relay.keyAuthorization(),
      Relay.accounts({ store: Store.memory() }),
    ],
  })

  beforeAll(async () => {
    await Actions.faucet.fundSync(caller, {
      account: feePayerAccount,
      timeout: 60_000,
    })
  })

  test('behavior: attaches a coordinated key authorization at quorum', async () => {
    const owners = [Tempo.accounts[10]!, Tempo.accounts[11]!] as const
    const account = Account.fromConfig({
      address: 'infer',
      owners,
      salt: toHex(0x514100, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })
    await Actions.token.transferSync(caller, {
      account: feePayerAccount,
      token: Tempo.addresses.alphaUsd,
      to: account.address,
      amount: 100_000n,
    })
    const client = createClient({
      chain: Tempo.chain,
      transport: withRelay(Tempo.http(), {
        plugins: [
          Relay.keyAuthorization(),
          Relay.accounts({ store: Store.memory() }),
        ],
      }),
    })

    const pending = await Actions.accessKey.signAuthorization(client, {
      accessKey,
      account,
      owner: owners[0],
    })

    expect(pending.status).toMatchInlineSnapshot(`"pending"`)

    await Actions.accessKey.signAuthorization(client, {
      hash: pending.hash,
      owner: owners[1],
    })
    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: 1n,
      feeToken: Tempo.addresses.alphaUsd,
      to: recipient.address,
      token: Tempo.addresses.alphaUsd,
    })
    const transaction = await Actions.accounts.getOperation(client, {
      hash: pending.hash,
    })

    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(transaction?.status).toMatchInlineSnapshot(`"success"`)
  })

  test('behavior: skips a coordinated key authorization that expired before quorum', async () => {
    const owners = [Tempo.accounts[16]!, Tempo.accounts[17]!] as const
    const account = Account.fromConfig({
      address: 'infer',
      owners,
      salt: toHex(0x514103, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })
    const client = createClient({
      chain: Tempo.chain,
      transport: withRelay(Tempo.http(), {
        plugins: [
          Relay.keyAuthorization(),
          Relay.accounts({ store: Store.memory() }),
        ],
      }),
    })

    const pending = await Actions.accessKey.signAuthorization(client, {
      accessKey,
      account,
      expiry: Math.floor(Date.now() / 1000) + 2,
      owner: owners[0],
    })
    await new Promise((resolve) => setTimeout(resolve, 2_000))
    const success = await Actions.accessKey.signAuthorization(client, {
      hash: pending.hash,
      owner: owners[1],
    })

    expect(success.status).toMatchInlineSnapshot(`"success"`)
    await expect(
      fillTransaction(client, {
        account: accessKey,
        feeToken: Tempo.addresses.alphaUsd,
        to: recipient.address,
      }),
    ).rejects.toThrow('KeyNotFound')
  })

  test('behavior: discards a pending key authorization after a config rotation', async () => {
    const owner = Tempo.accounts[18]!
    const account = Account.fromConfig({
      address: 'infer',
      owners: [owner],
      salt: toHex(0x514104, { size: 32 }),
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })
    const store = Store.memory()
    const client = createClient({
      chain: Tempo.chain,
      transport: withRelay(Tempo.http(), {
        plugins: [
          Relay.keyAuthorization({ store }),
          Relay.accounts({ store: Store.memory() }),
        ],
      }),
    })
    const key = [
      'keyAuthorization',
      Tempo.chain.id,
      account.address.toLowerCase(),
      accessKey.accessKeyAddress.toLowerCase(),
    ].join(':')
    await Actions.token.transferSync(caller, {
      account: feePayerAccount,
      token: Tempo.addresses.alphaUsd,
      to: account.address,
      amount: 100_000n,
    })
    await Actions.token.transferSync(caller, {
      account,
      amount: 1n,
      feeToken: Tempo.addresses.alphaUsd,
      to: recipient.address,
      token: Tempo.addresses.alphaUsd,
    })

    await Actions.accessKey.signAuthorization(client, { account, accessKey })

    expect(await store.getItem(key)).toBeTruthy()

    await Actions.accounts.updateConfigSync(caller, {
      account,
      currentConfig: account.config,
      feeToken: Tempo.addresses.alphaUsd,
      nextConfig: {
        owners: [
          { owner: owner.address, weight: 1 },
          { owner: recipient.address, weight: 1 },
        ],
        threshold: 1,
      },
    })

    await expect(
      fillTransaction(client, {
        account: accessKey,
        feeToken: Tempo.addresses.alphaUsd,
        to: recipient.address,
      }),
    ).rejects.toThrow('KeyNotFound')
    expect(await store.getItem(key)).toBeNull()
  })

  test('behavior: attaches a key authorization signed by external owners', async () => {
    const owners = [Tempo.accounts[13]!, Tempo.accounts[14]!] as const
    const account = Account.fromConfig({
      address: 'infer',
      owners: owners.map((owner) => owner.address),
      salt: toHex(0x514101, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })
    await Actions.token.transferSync(caller, {
      account: feePayerAccount,
      token: Tempo.addresses.alphaUsd,
      to: account.address,
      amount: 100_000n,
    })
    const client = createClient({
      chain: Tempo.chain,
      transport: withRelay(Tempo.http(), {
        plugins: [Relay.keyAuthorization()],
      }),
    })

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
      feeToken: Tempo.addresses.alphaUsd,
      to: recipient.address,
      token: Tempo.addresses.alphaUsd,
    })

    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })

  test('error: rejects a configurable account key authorization below quorum', async () => {
    const owners = [Tempo.accounts[13]!, Tempo.accounts[14]!] as const
    const account = Account.fromConfig({
      address: 'infer',
      owners: owners.map((owner) => owner.address),
      salt: toHex(0x514102, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })
    const authorization = await Actions.accessKey.prepareAuthorization(caller, {
      account,
      accessKey,
    })
    const keyAuthorization = KeyAuthorization.from(
      {
        account: account.address,
        address: accessKey.accessKeyAddress,
        chainId: BigInt(Tempo.chain.id),
        type: 'secp256k1',
      },
      {
        signature: SignatureEnvelope.from({
          account: account.address,
          config: account.config,
          signatures: [
            parseApproval(
              await owners[0].sign({ hash: authorization.signPayload }),
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

  test('error: rejects a configurable account key authorization for another account', async () => {
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })
    const keyAuthorization = KeyAuthorization.from(
      {
        account: recipient.address,
        address: accessKey.accessKeyAddress,
        chainId: BigInt(Tempo.chain.id),
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
})

describe.runIf(Tempo.configurableAccounts)(
  'plugin: accounts (configurable access key)',
  () => {
    const token = Tempo.addresses.alphaUsd
    const store = Store.memory()
    const relay = Relay.create({
      client: caller,
      plugins: [
        Relay.accounts({ store }),
        Relay.feePayer({ account: feePayerAccount }),
      ],
      resolveTokens: () => [token],
    })
    let clients: ReturnType<typeof createClients> = []

    beforeAll(async () => {
      const server = await createHttpServer(createRequestListener(relay.fetch))
      // Each owner approves from its own client, sharing only the relay.
      clients = createClients(server.url)
      await Actions.faucet.fundSync(caller, {
        account: feePayerAccount,
        timeout: 60_000,
      })
      return async () => {
        await server.close()
      }
    })

    test('default: collects owner approvals from separate clients', async () => {
      const client_1 = clients[0]!
      const client_2 = clients[1]!
      const owner_1 = Tempo.accounts[1]!
      const owner_2 = Tempo.accounts[2]!
      const { accessKey, parent } = await setupAccessKey({
        owners: [owner_1.address, owner_2.address],
        salt: 0x515000,
      })
      const before = await getBalance(recipient.address)

      const { receipt: pending } = await Actions.token.transferSync(client_1, {
        account: accessKey,
        amount: 1n,
        feePayer: true,
        owner: owner_1,
        to: recipient.address,
        token,
      })
      expect({
        account: pending.operation?.account,
        from: pending.from,
        signatureCount: pending.operation?.signatureCount,
        status: pending.status,
        userAddress: pending.operation?.userAddress,
      }).toEqual({
        account: accessKey.accessKeyAddress.toLowerCase(),
        from: parent.address.toLowerCase(),
        signatureCount: 1,
        status: 'pending',
        userAddress: parent.address.toLowerCase(),
      })
      expect(await getBalance(recipient.address)).toBe(before)

      const hash = pending.transactionHash
      await expect(
        Actions.accounts.getOperation(client_2, { hash }),
      ).resolves.toMatchObject({ status: 'pending', weight: 1 })
      await expect(
        client_2.request({
          method: 'eth_getTransactionByHash',
          params: [hash],
        }),
      ).resolves.toMatchObject({ from: parent.address.toLowerCase(), hash })
      await expect(
        client_2.request({
          method: 'eth_getTransactionReceipt',
          params: [hash],
        }),
      ).resolves.toBeNull()

      const { receipt } = await Actions.token.transferSync(client_2, {
        account: accessKey,
        amount: 1n,
        hash,
        owner: owner_2,
        to: recipient.address,
        token,
      } as never)
      expect({
        feePayer: receipt.feePayer,
        from: receipt.from,
        signatureCount: receipt.operation?.signatureCount,
        status: receipt.status,
      }).toEqual({
        feePayer: feePayerAccount.address.toLowerCase(),
        from: parent.address.toLowerCase(),
        signatureCount: 2,
        status: 'success',
      })
      expect((await getBalance(recipient.address)) - before).toBe(1n)

      const { signature } = await getTransaction(caller, {
        hash: receipt.transactionHash,
      })
      if (
        signature?.type !== 'keychain' ||
        signature.inner.type !== 'configurable'
      )
        throw new Error('Expected a configurable keychain signature.')
      expect({
        account: signature.inner.account,
        approvals: signature.inner.signatures.length,
        userAddress: signature.userAddress,
      }).toEqual({
        account: accessKey.accessKeyAddress.toLowerCase(),
        approvals: 2,
        userAddress: parent.address.toLowerCase(),
      })
      await expect(
        client_1.request({
          method: 'eth_getTransactionReceipt',
          params: [hash],
        }),
      ).resolves.toMatchObject({
        operation: { status: 'success' },
        transactionHash: receipt.transactionHash,
      })
    })

    test('behavior: same-transaction grant, then reuse once registered', async () => {
      const client_1 = clients[0]!
      const client_2 = clients[1]!
      const owner_1 = Tempo.accounts[3]!
      const owner_2 = Tempo.accounts[4]!
      const config = {
        owners: [owner_1.address, owner_2.address],
        salt: toHex(0x515001, { size: 32 }),
        threshold: 2,
      }
      const parent = await fundParent()
      const keyAuthorization = await Actions.accessKey.signAuthorization(
        caller,
        {
          account: parent,
          accessKey: {
            address: Account.fromConfig(config).address,
            type: 'configurable',
          },
        },
      )
      const accessKey = Account.fromConfig(config, {
        access: parent,
        keyAuthorization,
      })

      const send = async () => {
        const { receipt: pending } = await Actions.token.transferSync(
          client_1,
          {
            account: accessKey,
            amount: 1n,
            feePayer: true,
            owner: owner_1,
            to: recipient.address,
            token,
          },
        )
        expect(pending.status).toBe('pending')
        const { receipt } = await Actions.token.transferSync(client_2, {
          account: accessKey,
          amount: 1n,
          hash: pending.transactionHash,
          owner: owner_2,
          to: recipient.address,
          token,
        } as never)
        expect(receipt.status).toBe('success')
        expect(receipt.from).toBe(parent.address.toLowerCase())
        return await getTransaction(caller, { hash: receipt.transactionHash })
      }

      const first = await send()
      expect(first.keyAuthorization?.address).toBe(
        accessKey.accessKeyAddress.toLowerCase(),
      )
      await expect(
        Actions.accessKey.getMetadata(caller, { account: parent, accessKey }),
      ).resolves.toMatchObject({ isRevoked: false, keyType: 'configurable' })

      const second = await send()
      expect(second.keyAuthorization).toBeNull()
    })

    test('behavior: enforces spending limits', async () => {
      const client_1 = clients[0]!
      const client_2 = clients[1]!
      const owner_1 = Tempo.accounts[5]!
      const owner_2 = Tempo.accounts[6]!
      const { accessKey } = await setupAccessKey({
        limits: [{ limit: 10n, token }],
        owners: [owner_1.address, owner_2.address],
        salt: 0x515002,
      })

      const transfer = async (amount: bigint) => {
        const { receipt: pending } = await Actions.token.transferSync(
          client_1,
          {
            account: accessKey,
            amount,
            feePayer: true,
            owner: owner_1,
            to: recipient.address,
            token,
          },
        )
        return Actions.token.transferSync(client_2, {
          account: accessKey,
          amount,
          hash: pending.transactionHash,
          owner: owner_2,
          to: recipient.address,
          token,
        } as never)
      }

      expect((await transfer(10n)).receipt.status).toBe('success')
      await expect(transfer(1n)).rejects.toThrow(
        'Account keychain error: SpendingLimitExceeded',
      )
    })

    test('behavior: rejects a revoked access key', async () => {
      const client_1 = clients[0]!
      const owner_1 = Tempo.accounts[8]!
      const owner_2 = Tempo.accounts[10]!
      const { accessKey, parent } = await setupAccessKey({
        owners: [owner_1.address, owner_2.address],
        salt: 0x515003,
      })
      await Actions.accessKey.revokeSync(caller, {
        account: parent,
        accessKey,
        feeToken: token,
      })

      await expect(
        Actions.token.transferSync(client_1, {
          account: accessKey,
          amount: 1n,
          feePayer: true,
          owner: owner_1,
          to: recipient.address,
          token,
        }),
      ).rejects.toThrow('Key has already been revoked.')
    })

    test('behavior: respects expiry', async () => {
      const client_1 = clients[0]!
      const client_2 = clients[1]!
      const owner_1 = Tempo.accounts[11]!
      const owner_2 = Tempo.accounts[12]!
      const { timestamp } = await getBlock(caller)
      const expiry = Number(timestamp) + 8
      const { accessKey } = await setupAccessKey({
        expiry,
        owners: [owner_1.address, owner_2.address],
        salt: 0x515004,
      })

      const { receipt: pending } = await Actions.token.transferSync(client_1, {
        account: accessKey,
        amount: 1n,
        feePayer: true,
        owner: owner_1,
        to: recipient.address,
        token,
      })
      await waitForTimestamp(expiry + 1)
      await expect(
        Actions.token.transferSync(client_2, {
          account: accessKey,
          amount: 1n,
          hash: pending.transactionHash,
          owner: owner_2,
          to: recipient.address,
          token,
        } as never),
      ).rejects.toThrow(
        'Transaction access key is not authorized for its sender.',
      )
    })

    test('behavior: signs with the delegate config after updateConfig', async () => {
      const client_1 = clients[0]!
      const client_2 = clients[1]!
      const owner_1 = Tempo.accounts[13]!
      const owner_2 = Tempo.accounts[14]!
      const owner_3 = Tempo.accounts[15]!
      const owner_4 = Tempo.accounts[16]!
      const { accessKey, delegate, parent } = await setupAccessKey({
        owners: [owner_1.address, owner_2.address],
        salt: 0x515005,
      })
      await Actions.token.transferSync(caller, {
        account: feePayerAccount,
        amount: parseUnits('1', 6),
        to: delegate.address,
        token,
      })

      const { receipt: updatePending } =
        await Actions.accounts.updateConfigSync(client_1, {
          account: delegate,
          feeToken: token,
          nextConfig: {
            owners: [
              { owner: owner_3.address, weight: 1 },
              { owner: owner_4.address, weight: 1 },
            ],
            threshold: 2,
          },
          owner: owner_1,
        })
      const updateReceipt = await sendTransactionSync(client_2, {
        account: delegate,
        hash: updatePending.transactionHash,
        owner: owner_2,
      })
      expect(updateReceipt.status).toBe('success')

      // Approvals under the replaced config no longer reach quorum.
      await expect(
        Actions.token.transferSync(client_1, {
          account: accessKey,
          amount: 1n,
          feePayer: true,
          owner: owner_1,
          to: recipient.address,
          token,
        }),
      ).rejects.toThrow('account configuration commitment mismatch')

      const rotated = Account.fromConfig(delegate.address, { access: parent })
      const { receipt: pending } = await Actions.token.transferSync(client_1, {
        account: rotated,
        amount: 1n,
        feePayer: true,
        owner: owner_3,
        to: recipient.address,
        token,
      })
      expect(pending.operation?.config.version).toBe(1n)
      const { receipt } = await Actions.token.transferSync(client_2, {
        account: rotated,
        amount: 1n,
        hash: pending.transactionHash,
        owner: owner_4,
        to: recipient.address,
        token,
      } as never)
      expect(receipt.status).toBe('success')
      expect(receipt.from).toBe(parent.address.toLowerCase())
    })

    test('error: rejects an approval from a non-owner', async () => {
      const client_1 = clients[0]!
      const { accessKey } = await setupAccessKey({
        owners: [Tempo.accounts[17]!.address, Tempo.accounts[18]!.address],
        salt: 0x515006,
      })
      await expect(
        Actions.token.transferSync(client_1, {
          account: accessKey,
          amount: 1n,
          feePayer: true,
          owner: Tempo.accounts[19]!,
          to: recipient.address,
          token,
        }),
      ).rejects.toThrow(
        'Invalid operation approval: signature is from non-owner',
      )
    })
  },
)

/** Creates one relay client per owner. */
function createClients(url: string) {
  return [0, 1].map(() =>
    createClient({
      chain: Tempo.chain,
      pollingInterval: 100,
      transport: withRelay(Tempo.http(), Tempo.http(url)),
    }),
  )
}

/** Funds a fresh parent account with the fee and transfer token. */
async function fundParent() {
  const parent = Account.fromSecp256k1(generatePrivateKey())
  await Actions.token.transferSync(caller, {
    account: feePayerAccount,
    amount: parseUnits('1', 6),
    to: parent.address,
    token: Tempo.addresses.alphaUsd,
  })
  return parent
}

/** Authorizes a configurable account as an access key of a fresh parent. */
async function setupAccessKey(options: {
  expiry?: number | undefined
  limits?: { limit: bigint; token: Address }[] | undefined
  owners: readonly Address[]
  salt: number
}) {
  const { expiry, limits, owners, salt } = options
  const parent = await fundParent()
  const config = { owners, salt: toHex(salt, { size: 32 }), threshold: 2 }
  const delegate = Account.fromConfig(config)
  const accessKey = Account.fromConfig(config, { access: parent })
  await Actions.accessKey.authorizeSync(caller, {
    account: parent,
    accessKey,
    expiry,
    feeToken: Tempo.addresses.alphaUsd,
    limits,
  })
  return { accessKey, delegate, parent }
}

/** Reads the recipient's transfer token balance. */
async function getBalance(account: Address) {
  const { amount } = await Actions.token.getBalance(caller, {
    account,
    token: Tempo.addresses.alphaUsd,
  })
  return amount
}

/** Waits until the chain produces a block at or past \`timestamp\`. */
async function waitForTimestamp(timestamp: number) {
  for (;;) {
    const block = await getBlock(caller)
    if (Number(block.timestamp) >= timestamp) return
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
}
