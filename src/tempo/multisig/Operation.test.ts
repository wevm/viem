import { Address, P256 } from 'ox'
import * as Json from 'ox/Json'
import {
  KeyAuthorization,
  MultisigConfig,
  MultisigOperation,
  SignatureEnvelope,
  TxEnvelopeTempo,
} from 'ox/tempo'
import { Store } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import * as Operation from './Operation.js'

const owners = [1n, 2n]
  .map((value, index) => {
    const publicKey = P256.getPublicKey({
      privateKey: `0x${value.toString(16).padStart(64, '0')}`,
    })
    return {
      address: Address.fromPublicKey(publicKey),
      signature: SignatureEnvelope.serialize({
        prehash: false,
        publicKey,
        signature: { r: BigInt(index * 2 + 1), s: BigInt(index * 2 + 2) },
        type: 'p256',
      }),
    }
  })
  .sort((a, b) => a.address.localeCompare(b.address))
const initialConfig = MultisigConfig.from({
  owners: owners.map((owner) => ({ owner: owner.address, weight: 1 })),
  threshold: 2,
})
const account = MultisigConfig.getAddress(initialConfig)
const config = MultisigConfig.from({ ...initialConfig, version: 1n })
const transaction = TxEnvelopeTempo.serialize(
  TxEnvelopeTempo.from({
    calls: [{ data: '0x1234', to: owners[0]!.address }],
    chainId: 4217,
  }),
)
const hash = MultisigConfig.getSignPayload({
  account,
  config,
  payload: TxEnvelopeTempo.getSignPayload(
    TxEnvelopeTempo.deserialize(transaction),
  ),
})
const base = {
  account,
  approvals: [owners[0]!.signature],
  config,
  createdAt: 1,
  signatureCount: 1,
  threshold: 2,
  updatedAt: 2,
  weight: 1,
} as const
const operation = MultisigOperation.from({
  ...base,
  hash,
  status: 'pending',
  transaction,
  type: 'transaction',
})
const otherTransaction = TxEnvelopeTempo.serialize(
  TxEnvelopeTempo.from({
    calls: [{ data: '0x5678', to: owners[1]!.address }],
    chainId: 4217,
  }),
)
const otherOperation = MultisigOperation.from({
  ...base,
  hash: MultisigConfig.getSignPayload({
    account,
    config,
    payload: TxEnvelopeTempo.getSignPayload(
      TxEnvelopeTempo.deserialize(otherTransaction),
    ),
  }),
  status: 'pending',
  transaction: otherTransaction,
  type: 'transaction',
})
const keyAuthorization = KeyAuthorization.serialize(
  KeyAuthorization.from({
    account,
    address: '0x3333333333333333333333333333333333333333',
    chainId: 4217n,
    isAdmin: false,
    type: 'secp256k1',
  }),
)
const keyAuthorizationOperation = MultisigOperation.from({
  ...base,
  hash: MultisigConfig.getSignPayload({
    account,
    config,
    payload: KeyAuthorization.getSignPayload(
      KeyAuthorization.deserialize(keyAuthorization),
    ),
  }),
  keyAuthorization,
  status: 'pending',
  type: 'keyAuthorization',
})
const keyAuthorizationSuccess = MultisigOperation.from({
  ...keyAuthorizationOperation,
  approvals: owners.map((owner) => owner.signature),
  keyAuthorization: KeyAuthorization.serialize(
    KeyAuthorization.from(KeyAuthorization.deserialize(keyAuthorization), {
      signature: SignatureEnvelope.from({
        account,
        config,
        signatures: owners.map((owner) =>
          SignatureEnvelope.deserialize(owner.signature),
        ),
      }),
    }),
  ),
  signatureCount: 2,
  status: 'success',
  weight: 2,
})

describe('read', () => {
  test('default', async () => {
    const store = Store.memory()
    await Operation.update(store, hash, () => operation)

    expect(await Operation.read(store, hash)).toMatchInlineSnapshot(
      {
        approvals: [expect.any(String)],
        transaction: expect.any(String),
      },
      `
      {
        "account": "0xf75618474e5f7fd9ef17dd85167a5b1e1f19b84b",
        "approvals": [
          Any<String>,
        ],
        "config": {
          "owners": [
            {
              "owner": "0x288f0cd85005f34168f731a468aef268c2f9456f",
              "weight": 1,
            },
            {
              "owner": "0xd3a9f047ad43d7e2e4e7e491f1fe2e657a2651b6",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "threshold": 2,
          "version": 1n,
        },
        "createdAt": 1,
        "hash": "0x837807510029fcb64338b96f2ec398978d75cdee4989e40adc58d30c3b46d717",
        "signatureCount": 1,
        "status": "pending",
        "threshold": 2,
        "transaction": Any<String>,
        "type": "transaction",
        "updatedAt": 2,
        "weight": 1,
      }
    `,
    )
  })

  test('behavior: unknown operation', async () => {
    await expect(Operation.read(Store.memory(), hash)).resolves.toBeNull()
  })

  test('error: mismatched operation hash', async () => {
    const store = Store.memory()
    await store.setItem(
      `multisig:operation:${hash}`,
      Json.stringify(otherOperation),
    )

    await expect(Operation.read(store, hash)).rejects.toThrowError(
      Operation.InvalidStoreValueError,
    )
  })

  test('behavior: key authorization operation', async () => {
    const store = Store.memory()
    await Operation.update(
      store,
      keyAuthorizationOperation.hash,
      () => keyAuthorizationOperation,
    )

    expect(
      await Operation.read(store, keyAuthorizationOperation.hash),
    ).toMatchInlineSnapshot(
      {
        approvals: [expect.any(String)],
        keyAuthorization: expect.any(String),
      },
      `
      {
        "account": "0xf75618474e5f7fd9ef17dd85167a5b1e1f19b84b",
        "approvals": [
          Any<String>,
        ],
        "config": {
          "owners": [
            {
              "owner": "0x288f0cd85005f34168f731a468aef268c2f9456f",
              "weight": 1,
            },
            {
              "owner": "0xd3a9f047ad43d7e2e4e7e491f1fe2e657a2651b6",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "threshold": 2,
          "version": 1n,
        },
        "createdAt": 1,
        "hash": "0xb22d88f1fbdb78b42a9d6289d2ebda1cb52dcd18581b3bb5a0de3a48a2fc1e55",
        "keyAuthorization": Any<String>,
        "signatureCount": 1,
        "status": "pending",
        "threshold": 2,
        "type": "keyAuthorization",
        "updatedAt": 2,
        "weight": 1,
      }
    `,
    )
  })

  test('behavior: successful key authorization operation', async () => {
    const store = Store.memory()
    await Operation.update(
      store,
      keyAuthorizationSuccess.hash,
      () => keyAuthorizationSuccess,
    )

    expect(
      await Operation.read(store, keyAuthorizationSuccess.hash),
    ).toMatchInlineSnapshot(
      {
        approvals: [expect.any(String), expect.any(String)],
        keyAuthorization: expect.any(String),
      },
      `
      {
        "account": "0xf75618474e5f7fd9ef17dd85167a5b1e1f19b84b",
        "approvals": [
          Any<String>,
          Any<String>,
        ],
        "config": {
          "owners": [
            {
              "owner": "0x288f0cd85005f34168f731a468aef268c2f9456f",
              "weight": 1,
            },
            {
              "owner": "0xd3a9f047ad43d7e2e4e7e491f1fe2e657a2651b6",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "threshold": 2,
          "version": 1n,
        },
        "createdAt": 1,
        "hash": "0xb22d88f1fbdb78b42a9d6289d2ebda1cb52dcd18581b3bb5a0de3a48a2fc1e55",
        "keyAuthorization": Any<String>,
        "signatureCount": 2,
        "status": "success",
        "threshold": 2,
        "type": "keyAuthorization",
        "updatedAt": 2,
        "weight": 2,
      }
    `,
    )
  })
})

describe('update', () => {
  test('behavior: retries compare-and-set conflicts', async () => {
    const memory = Store.memory()
    let conflict = true
    const store = Store.from({
      async compareAndSet(key, expected, value, options) {
        if (conflict) {
          conflict = false
          return false
        }
        return await memory.compareAndSet(key, expected, value, options)
      },
      getItem: (key) => memory.getItem(key),
      removeItem: (key) => memory.removeItem(key),
      setItem: (key, value) => memory.setItem(key, value),
    })

    await expect(
      Operation.update(store, hash, () => operation),
    ).resolves.toStrictEqual(operation)
    await expect(Operation.read(store, hash)).resolves.toStrictEqual(operation)
  })

  test('behavior: expires incomplete operations', async () => {
    const memory = Store.memory()
    const expirations: (number | undefined)[] = []
    const store = Store.from({
      compareAndSet(key, expected, value, options) {
        expirations.push(options?.expiresAt)
        return memory.compareAndSet(key, expected, value, options)
      },
      getItem: (key) => memory.getItem(key),
      removeItem: (key) => memory.removeItem(key),
      setItem: (key, value) => memory.setItem(key, value),
    })
    const before = Date.now()

    await Operation.update(store, hash, () => operation)
    await Operation.update(store, hash, () =>
      MultisigOperation.from({
        ...operation,
        approvals: owners.map((owner) => owner.signature),
        signatureCount: 2,
        status: 'success',
        transactionHash: `0x${'aa'.repeat(32)}`,
        weight: 2,
      }),
    )

    expect(expirations[0]).toBeGreaterThanOrEqual(
      before + 30 * 24 * 60 * 60 * 1_000,
    )
    expect(expirations[1]).toBeUndefined()
  })

  test('error: repeated compare-and-set conflicts', async () => {
    const store = Store.from({
      compareAndSet: async () => false,
      getItem: async () => null,
      removeItem() {},
      setItem() {},
    })

    await expect(
      Operation.update(store, hash, () => operation),
    ).rejects.toThrowError(Operation.StoreConflictError)
  })

  test('error: stored operation hash does not match', async () => {
    const store = Store.from({
      compareAndSet: async () => true,
      getItem: async () => Json.stringify(otherOperation),
      removeItem() {},
      setItem() {},
    })

    await expect(
      Operation.update(store, hash, () => operation),
    ).rejects.toThrowError(Operation.InvalidStoreValueError)
  })

  test('error: updated operation hash does not match', async () => {
    await expect(
      Operation.update(Store.memory(), hash, () => otherOperation),
    ).rejects.toThrowError(Operation.InvalidStoreValueError)
  })

  test('error: updated operation payload does not match hash', async () => {
    await expect(
      Operation.update(Store.memory(), hash, () => ({
        ...operation,
        transaction: otherTransaction,
      })),
    ).rejects.toThrowError(Operation.InvalidStoreValueError)
  })

  test('error: update callback error', async () => {
    const error = new Error('Invalid approval.')

    await expect(
      Operation.update(Store.memory(), hash, () => {
        throw error
      }),
    ).rejects.toBe(error)
  })
})

describe('submission', () => {
  const submissionId = `0x${'11'.repeat(32)}` as const

  test('behavior: persists a final serialized transaction', async () => {
    const store = Store.memory()
    const signed = MultisigOperation.serializeTransaction(operation, {
      approvals: operation.approvals,
    })

    await Operation.writeSubmission(store, hash, submissionId, signed)

    expect(
      await Operation.readSubmission(store, operation, submissionId),
    ).toMatchInlineSnapshot(
      `"0x328b36e6ff34123fe429b6b3df55edebdb4998616f64b5a40c6c2be969ccf2f3"`,
    )
  })

  test('behavior: removes a persisted transaction', async () => {
    const store = Store.memory()
    const signed = MultisigOperation.serializeTransaction(operation, {
      approvals: operation.approvals,
    })
    await Operation.writeSubmission(store, hash, submissionId, signed)

    await Operation.removeSubmission(store, hash, submissionId)

    await expect(
      Operation.readSubmission(store, operation, submissionId),
    ).resolves.toMatchInlineSnapshot(`null`)
  })

  test('behavior: unknown submission', async () => {
    await expect(
      Operation.readSubmission(Store.memory(), operation, submissionId),
    ).resolves.toBeNull()
  })

  test('error: submission belongs to another operation', async () => {
    const store = Store.memory()
    const signed = MultisigOperation.serializeTransaction(otherOperation, {
      approvals: otherOperation.approvals,
    })
    await Operation.writeSubmission(store, hash, submissionId, signed)

    await expect(
      Operation.readSubmission(store, operation, submissionId),
    ).rejects.toThrowError(Operation.InvalidStoreValueError)
  })

  test('error: refuses an unsigned transaction', async () => {
    await expect(
      Operation.writeSubmission(
        Store.memory(),
        hash,
        submissionId,
        transaction,
      ),
    ).rejects.toThrowError(Operation.InvalidStoreValueError)
  })

  test.each(['{}', transaction])(
    'error: malformed submission %#',
    async (value) => {
      const store = Store.memory()
      await store.setItem(`multisig:submission:${hash}:${submissionId}`, value)

      await expect(
        Operation.readSubmission(store, operation, submissionId),
      ).rejects.toThrowError(Operation.InvalidStoreValueError)
    },
  )
})

describe('storage serialization', () => {
  test('behavior: round trip', async () => {
    const store = Store.memory()
    await Operation.update(store, hash, () => operation)

    await expect(Operation.read(store, hash)).resolves.toStrictEqual(operation)
  })

  test('error: oversized value', async () => {
    const oversizedTransaction = TxEnvelopeTempo.serialize(
      TxEnvelopeTempo.from({
        calls: [
          {
            data: `0x${'aa'.repeat(524_288)}`,
            to: owners[0]!.address,
          },
        ],
        chainId: 4217,
      }),
    )
    const oversized = MultisigOperation.from({
      ...operation,
      hash: MultisigConfig.getSignPayload({
        account,
        config,
        payload: TxEnvelopeTempo.getSignPayload(
          TxEnvelopeTempo.deserialize(oversizedTransaction),
        ),
      }),
      transaction: oversizedTransaction,
    })

    await expect(
      Operation.update(Store.memory(), oversized.hash, () => oversized),
    ).rejects.toThrowError(Operation.InvalidStoreValueError)

    const store = Store.memory()
    await store.setItem(`multisig:operation:${hash}`, ' '.repeat(1_048_577))
    await expect(Operation.read(store, hash)).rejects.toThrowError(
      Operation.InvalidStoreValueError,
    )
  })

  test('error: malformed value', async () => {
    const store = Store.memory()
    await store.setItem(`multisig:operation:${hash}`, '{')

    await expect(Operation.read(store, hash)).rejects.toThrowError(
      Operation.InvalidStoreValueError,
    )
  })

  test.each([
    Json.stringify(otherOperation).replace(otherOperation.hash, hash),
    Json.stringify(keyAuthorizationOperation).replace(
      keyAuthorizationOperation.hash,
      hash,
    ),
  ])('error: operation payload does not match hash %#', async (value) => {
    const store = Store.memory()
    await store.setItem(`multisig:operation:${hash}`, value)

    await expect(Operation.read(store, hash)).rejects.toThrowError(
      Operation.InvalidStoreValueError,
    )
  })
})

describe('InvalidStoreValueError', () => {
  test('default', () => {
    expect(new Operation.InvalidStoreValueError()).toMatchInlineSnapshot(`
      [Multisig.Operation.InvalidStoreValueError: Stored multisig operation is malformed or unsupported.

      Version: viem@x.y.z]
    `)
  })

  test('behavior: cause', () => {
    const cause = new Error('invalid value')
    const error = new Operation.InvalidStoreValueError({ cause })

    expect(error.cause).toBe(cause)
  })
})
