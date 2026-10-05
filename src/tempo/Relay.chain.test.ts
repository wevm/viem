import {
  KeyAuthorization,
  MultisigConfig,
  MultisigOperation,
  SignatureEnvelope,
  TxEnvelopeTempo as Transaction,
} from 'ox/tempo'
import { Account, Relay, Store } from 'viem/tempo'
import { expect, test } from 'vitest'
import { nativeMultisigFactory } from './Addresses.js'
import * as Operation from './multisig/Operation.js'
import { parseApproval } from './multisig/Signature.js'

const owner = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)
const config = MultisigConfig.from({
  owners: [{ owner: owner.address, weight: 1 }],
  threshold: 1,
})
const account = MultisigConfig.getAddress(config, {
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
    { plugins: [Relay.multisig({ store: Store.memory() })] },
  )
  const transaction = await Transaction.serialize({
    calls: [{ to: account }],
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
    { plugins: [Relay.multisig({ store: Store.memory() })] },
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
      method: 'multisig_approveKeyAuthorization',
      params: [{ keyAuthorization: KeyAuthorization.toRpc(keyAuthorization) }],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Error: eth_blockNumber:4217]
  `)
})

test('behavior: resolves the chain from a stored transaction operation', async () => {
  const store = Store.memory()
  const transaction = await Transaction.serialize({
    calls: [{ to: account }],
    chainId: 4217,
  })
  const hash = MultisigOperation.getHash({
    account,
    config,
    transaction,
    type: 'transaction',
  })
  const validApproval = SignatureEnvelope.serialize(
    SignatureEnvelope.from(await owner.sign({ hash })),
  )
  await Operation.update(store, hash, () =>
    MultisigOperation.from({
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
    { plugins: [Relay.multisig({ store })] },
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
  const hash = MultisigOperation.getHash({
    account,
    config,
    keyAuthorization,
    type: 'keyAuthorization',
  })
  await Operation.update(store, hash, () =>
    MultisigOperation.from({
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
    { plugins: [Relay.multisig({ store })] },
  )

  await expect(
    handle({
      method: 'multisig_approveKeyAuthorization',
      params: [{ hash, signature: serializedApproval }],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Error: eth_blockNumber:4217]
  `)
})

test('error: rejects conflicting chain ids', async () => {
  const handle = Relay.handleRequest(async () => null, {
    plugins: [Relay.multisig({ store: Store.memory() })],
  })
  const transaction = await Transaction.serialize({
    calls: [{ to: account }],
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
