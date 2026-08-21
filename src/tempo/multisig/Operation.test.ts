import * as Json from 'ox/Json'
import { KeyAuthorization, SignatureEnvelope, TxEnvelopeTempo } from 'ox/tempo'
import { Storage } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import * as Operation from './Operation.js'

const hash =
  '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const otherId =
  '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
const ownerSignature = {
  signature: {
    r: BigInt(`0x76${'11'.repeat(31)}`),
    s: 1n,
    yParity: 0,
  },
  type: 'secp256k1',
} as const
const approval = SignatureEnvelope.serialize(ownerSignature)
const base = {
  account: '0x1111111111111111111111111111111111111111',
  approvals: [approval],
  config: {
    owners: [
      { owner: '0x1111111111111111111111111111111111111111', weight: 1 },
      { owner: '0x2222222222222222222222222222222222222222', weight: 1 },
    ],
    threshold: 2,
  },
  createdAt: 1,
  hash,
  signatures: 1,
  threshold: 2,
  updatedAt: 1,
  version: 1n,
  weight: 1,
} as const
const operation = Operation.from({
  ...base,
  init: false,
  status: 'pending',
  transaction: TxEnvelopeTempo.from({
    calls: [{ to: '0x1111111111111111111111111111111111111111' }],
    chainId: 4217,
    type: 'tempo',
  }),
})
const keyAuthorization = KeyAuthorization.from({
  address: '0x3333333333333333333333333333333333333333',
  chainId: 4217n,
  expiry: 1_800_000_000,
  type: 'secp256k1',
})

describe('read', () => {
  test('default', async () => {
    const store = Storage.memory()
    await store.compareAndSet?.(
      `multisig:operation:${hash}`,
      null,
      Operation.serialize(operation),
    )

    expect(await Operation.read(store, hash)).toMatchInlineSnapshot(`
      {
        "account": "0x1111111111111111111111111111111111111111",
        "approvals": [
          "0x761111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000011b",
        ],
        "config": {
          "owners": [
            {
              "owner": "0x1111111111111111111111111111111111111111",
              "weight": 1,
            },
            {
              "owner": "0x2222222222222222222222222222222222222222",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "threshold": 2,
        },
        "createdAt": 1,
        "hash": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "init": false,
        "schemaVersion": 1,
        "signatures": 1,
        "status": "pending",
        "threshold": 2,
        "transaction": {
          "calls": [
            {
              "to": "0x1111111111111111111111111111111111111111",
            },
          ],
          "chainId": 4217,
          "type": "tempo",
        },
        "updatedAt": 1,
        "version": 1n,
        "weight": 1,
      }
    `)
  })

  test('behavior: unknown operation', async () => {
    await expect(Operation.read(Storage.memory(), hash)).resolves.toBeNull()
  })

  test('error: mismatched operation hash', async () => {
    const store = Storage.memory()
    await store.compareAndSet?.(
      `multisig:operation:${hash}`,
      null,
      Operation.serialize({ ...operation, hash: otherId }),
    )

    await expect(Operation.read(store, hash)).rejects.toThrowError(
      Operation.InvalidStoreValueError,
    )
  })

  test('behavior: key authorization states', () => {
    const pending = Operation.from({
      ...base,
      keyAuthorization,
      status: 'pending',
    })
    const success = Operation.from({
      ...base,
      keyAuthorization: KeyAuthorization.from(keyAuthorization, {
        signature: ownerSignature,
      }),
      status: 'success',
    })

    expect(pending).toMatchInlineSnapshot(`
      {
        "account": "0x1111111111111111111111111111111111111111",
        "approvals": [
          "0x761111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000011b",
        ],
        "config": {
          "owners": [
            {
              "owner": "0x1111111111111111111111111111111111111111",
              "weight": 1,
            },
            {
              "owner": "0x2222222222222222222222222222222222222222",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "threshold": 2,
        },
        "createdAt": 1,
        "hash": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "keyAuthorization": {
          "address": "0x3333333333333333333333333333333333333333",
          "chainId": 4217n,
          "expiry": 1800000000,
          "type": "secp256k1",
        },
        "schemaVersion": 1,
        "signatures": 1,
        "status": "pending",
        "threshold": 2,
        "updatedAt": 1,
        "version": 1n,
        "weight": 1,
      }
    `)
    expect(success).toMatchInlineSnapshot(`
      {
        "account": "0x1111111111111111111111111111111111111111",
        "approvals": [
          "0x761111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000011b",
        ],
        "config": {
          "owners": [
            {
              "owner": "0x1111111111111111111111111111111111111111",
              "weight": 1,
            },
            {
              "owner": "0x2222222222222222222222222222222222222222",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "threshold": 2,
        },
        "createdAt": 1,
        "hash": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "keyAuthorization": {
          "address": "0x3333333333333333333333333333333333333333",
          "chainId": 4217n,
          "expiry": 1800000000,
          "signature": {
            "signature": {
              "r": 53403070322730984920610472513121428335453422615325374717156088874482852237585n,
              "s": 1n,
              "yParity": 0,
            },
            "type": "secp256k1",
          },
          "type": "secp256k1",
        },
        "schemaVersion": 1,
        "signatures": 1,
        "status": "success",
        "threshold": 2,
        "updatedAt": 1,
        "version": 1n,
        "weight": 1,
      }
    `)
  })
})

describe('update', () => {
  test('behavior: retries compare-and-set conflicts', async () => {
    const memory = Storage.memory()
    let conflict = true
    const store = Storage.from({
      async compareAndSet(key, expected, value) {
        if (conflict) {
          conflict = false
          return false
        }
        return await memory.compareAndSet!(key, expected, value)
      },
      getItem: (key) => memory.getItem(key),
      removeItem: (key) => memory.removeItem(key),
      setItem: (key, value) => memory.setItem(key, value),
    })

    await expect(
      Operation.update(store, hash, () => operation),
    ).resolves.toMatchInlineSnapshot(`
      {
        "account": "0x1111111111111111111111111111111111111111",
        "approvals": [
          "0x761111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000011b",
        ],
        "config": {
          "owners": [
            {
              "owner": "0x1111111111111111111111111111111111111111",
              "weight": 1,
            },
            {
              "owner": "0x2222222222222222222222222222222222222222",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "threshold": 2,
        },
        "createdAt": 1,
        "hash": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "init": false,
        "schemaVersion": 1,
        "signatures": 1,
        "status": "pending",
        "threshold": 2,
        "transaction": {
          "calls": [
            {
              "to": "0x1111111111111111111111111111111111111111",
            },
          ],
          "chainId": 4217,
          "type": "tempo",
        },
        "updatedAt": 1,
        "version": 1n,
        "weight": 1,
      }
    `)
    await expect(Operation.read(store, hash)).resolves.toMatchInlineSnapshot(`
      {
        "account": "0x1111111111111111111111111111111111111111",
        "approvals": [
          "0x761111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000011b",
        ],
        "config": {
          "owners": [
            {
              "owner": "0x1111111111111111111111111111111111111111",
              "weight": 1,
            },
            {
              "owner": "0x2222222222222222222222222222222222222222",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "threshold": 2,
        },
        "createdAt": 1,
        "hash": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "init": false,
        "schemaVersion": 1,
        "signatures": 1,
        "status": "pending",
        "threshold": 2,
        "transaction": {
          "calls": [
            {
              "to": "0x1111111111111111111111111111111111111111",
            },
          ],
          "chainId": 4217,
          "type": "tempo",
        },
        "updatedAt": 1,
        "version": 1n,
        "weight": 1,
      }
    `)
  })

  test('behavior: falls back to get and set', async () => {
    const values = new Map<string, string>()
    const store = Storage.from({
      getItem: (key) => values.get(key),
      removeItem: (key) => {
        values.delete(key)
      },
      setItem: (key, value) => {
        values.set(key, value)
      },
    })

    await expect(
      Operation.update(store, hash, () => operation),
    ).resolves.toStrictEqual(operation)
    await expect(Operation.read(store, hash)).resolves.toStrictEqual(operation)
  })

  test('error: repeated compare-and-set conflicts', async () => {
    const store = Storage.from({
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
    const store = Storage.from({
      compareAndSet: async () => true,
      getItem: async () => Operation.serialize({ ...operation, hash: otherId }),
      removeItem() {},
      setItem() {},
    })

    await expect(
      Operation.update(store, hash, () => operation),
    ).rejects.toThrowError(Operation.InvalidStoreValueError)
  })

  test('error: updated operation hash does not match', async () => {
    await expect(
      Operation.update(Storage.memory(), hash, () => ({
        ...operation,
        hash: otherId,
      })),
    ).rejects.toThrowError(Operation.InvalidStoreValueError)
  })
})

describe('serialize', () => {
  test('behavior: round trip', () => {
    expect(Operation.deserialize(Operation.serialize(operation))).toStrictEqual(
      operation,
    )
  })

  test('error: oversized value', () => {
    const oversized = {
      ...operation,
      approvals: [`0x${'aa'.repeat(524_288)}` as const],
    }

    expect(() => Operation.serialize(oversized)).toThrowError(
      Operation.InvalidStoreValueError,
    )
    expect(() => Operation.deserialize(' '.repeat(1_048_577))).toThrowError(
      Operation.InvalidStoreValueError,
    )
  })

  test('error: unsupported schema version', () => {
    expect(() =>
      Operation.deserialize(Json.stringify({ ...operation, schemaVersion: 2 })),
    ).toThrowError(Operation.InvalidStoreValueError)
  })
})

describe('InvalidStoreValueError', () => {
  test('default', () => {
    expect(new Operation.InvalidStoreValueError()).toMatchInlineSnapshot(`
      [Multisig.Operation.InvalidStoreValueError: Stored multisig operation is malformed or unsupported.

      Version: viem@2.55.19]
    `)
  })

  test('behavior: cause', () => {
    const cause = new Error('invalid value')
    const error = new Operation.InvalidStoreValueError({ cause })

    expect(error.cause).toBe(cause)
  })
})
