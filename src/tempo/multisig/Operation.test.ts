import { KeyAuthorization, SignatureEnvelope, TxEnvelopeTempo } from 'ox/tempo'
import { describe, expect, test } from 'vitest'
import * as Operation from './Operation.js'
import * as Store from './Store.js'

const id = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
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
  id,
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
    const store = Store.memory()
    await store.compareAndSet(`multisig:operation:${id}`, null, operation)

    expect(await Operation.read(store, id)).toMatchInlineSnapshot(`
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
        "id": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
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
    await expect(Operation.read(Store.memory(), id)).resolves.toBeNull()
  })

  test('error: mismatched operation ID', async () => {
    const store = Store.memory()
    await store.compareAndSet(`multisig:operation:${id}`, null, {
      ...operation,
      id: otherId,
    })

    await expect(Operation.read(store, id)).rejects.toThrowError(
      Store.InvalidStoreValueError,
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
        "id": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
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
        "id": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
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
    const memory = Store.memory()
    let conflict = true
    const store = Store.from({
      source: {
        compareAndSet: async (key, expected, value) => {
          if (conflict) {
            conflict = false
            return false
          }
          return await memory.compareAndSet(key, expected, value)
        },
        get: (key) => memory.get(key),
      },
    })

    await expect(
      Operation.update(store, id, () => operation),
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
        "id": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
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
    await expect(Operation.read(store, id)).resolves.toMatchInlineSnapshot(`
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
        "id": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
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

  test('error: repeated compare-and-set conflicts', async () => {
    const store = Store.from({
      source: {
        compareAndSet: async () => false,
        get: async () => null,
      },
    })

    await expect(
      Operation.update(store, id, () => operation),
    ).rejects.toThrowError(Store.StoreConflictError)
  })

  test('error: stored operation ID does not match', async () => {
    const store = Store.from({
      source: {
        compareAndSet: async () => true,
        get: async () => ({ ...operation, id: otherId }),
      },
    })

    await expect(
      Operation.update(store, id, () => operation),
    ).rejects.toThrowError(Store.InvalidStoreValueError)
  })

  test('error: updated operation ID does not match', async () => {
    await expect(
      Operation.update(Store.memory(), id, () => ({
        ...operation,
        id: otherId,
      })),
    ).rejects.toThrowError(Store.InvalidStoreValueError)
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
      Store.InvalidStoreValueError,
    )
    expect(() => Operation.deserialize(' '.repeat(1_048_577))).toThrowError(
      Store.InvalidStoreValueError,
    )
  })
})
