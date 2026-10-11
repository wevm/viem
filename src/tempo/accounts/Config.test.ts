import * as Hex from 'ox/Hex'
import * as Json from 'ox/Json'
import { AccountConfig } from 'ox/tempo'
import { describe, expect, test } from 'vitest'
import { nativeMultisigFactory } from '../Addresses.js'
import * as Store from '../Store.js'
import * as Config from './Config.js'

const owner = '0x1111111111111111111111111111111111111111'
const initialConfig = AccountConfig.from({
  owners: [{ owner, weight: 1 }],
  threshold: 1,
})
const address = AccountConfig.getAddress(initialConfig, {
  factory: nativeMultisigFactory,
})
const zeroCommitment = Hex.fromNumber(0, { size: 32 })
const currentConfig = AccountConfig.from({
  ...initialConfig,
  version: 1,
})
const currentCommitment = AccountConfig.getCommitment(currentConfig)

describe('read', () => {
  test('behavior: retains the initial config after initialization', async () => {
    const store = Store.memory()
    await Config.write(store, {
      address,
      commitment: zeroCommitment,
      config: initialConfig,
    })
    const commitment = AccountConfig.getCommitment(initialConfig)
    expect(await Config.read(store, { address, commitment })).toEqual(
      initialConfig,
    )
    await Config.write(store, { address, commitment, config: initialConfig })
    expect(await Config.read(store, { address, commitment })).toEqual(
      initialConfig,
    )
  })

  test('behavior: returns an initial config', async () => {
    const store = Store.memory()
    await Config.write(store, {
      address,
      commitment: zeroCommitment,
      config: initialConfig,
    })

    await expect(
      Config.read(store, { address, commitment: zeroCommitment }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "owners": [
          {
            "owner": "0x1111111111111111111111111111111111111111",
            "weight": 1,
          },
        ],
        "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "threshold": 1,
        "version": 0n,
      }
    `)
  })

  test('behavior: returns a current config', async () => {
    const store = Store.memory()
    await Config.write(store, {
      address,
      commitment: currentCommitment,
      config: currentConfig,
    })

    await expect(
      Config.read(store, { address, commitment: currentCommitment }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "owners": [
          {
            "owner": "0x1111111111111111111111111111111111111111",
            "weight": 1,
          },
        ],
        "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "threshold": 1,
        "version": 1n,
      }
    `)
  })

  test('behavior: follows a previously seen commitment', async () => {
    const store = Store.memory()
    const rotatedConfig = AccountConfig.from({
      ...initialConfig,
      version: 2,
    })
    const rotatedCommitment = AccountConfig.getCommitment(rotatedConfig)
    await Config.write(store, {
      address,
      commitment: currentCommitment,
      config: currentConfig,
    })
    await Config.write(store, {
      address,
      commitment: rotatedCommitment,
      config: rotatedConfig,
    })

    expect([
      (
        await Config.read(store, {
          address,
          commitment: currentCommitment,
        })
      )?.version,
      (
        await Config.read(store, {
          address,
          commitment: rotatedCommitment,
        })
      )?.version,
      (
        await Config.read(store, {
          address,
          commitment: currentCommitment,
        })
      )?.version,
    ]).toMatchInlineSnapshot(`
      [
        1n,
        2n,
        1n,
      ]
    `)
  })

  test('behavior: returns null for an unknown config', async () => {
    await expect(
      Config.read(Store.memory(), {
        address,
        commitment: zeroCommitment,
      }),
    ).resolves.toMatchInlineSnapshot(`null`)
  })

  test.each([
    'invalid json',
    Json.stringify(AccountConfig.toRpc(currentConfig)),
    Json.stringify({
      ...AccountConfig.toRpc(initialConfig),
      owners: [],
    }),
    'x'.repeat(65_537),
  ])('error: rejects malformed stored data %#', async (value) => {
    const values = new Map<string, string>()
    const store = Store.from({
      getItem(key) {
        return values.get(key) ?? null
      },
      removeItem(key) {
        values.delete(key)
      },
      setItem(key, value) {
        values.set(key, value)
      },
    })
    await Config.write(store, {
      address,
      commitment: zeroCommitment,
      config: initialConfig,
    })
    const key = values.keys().next().value
    if (!key) throw new Error('Expected config store key.')
    values.set(key, value)

    await expect(
      Config.read(store, { address, commitment: zeroCommitment }),
    ).rejects.toMatchObject({
      name: 'Accounts.Config.InvalidStoreValueError',
      shortMessage: 'Stored account config is malformed or mismatched.',
    })
  })
})

describe('write', () => {
  test('error: rejects an initial config for another account', async () => {
    await expect(
      Config.write(Store.memory(), {
        address: '0x2222222222222222222222222222222222222222',
        commitment: zeroCommitment,
        config: initialConfig,
      }),
    ).rejects.toMatchObject({
      name: 'Accounts.Config.InvalidStoreValueError',
      shortMessage: 'Stored account config is malformed or mismatched.',
    })
  })

  test('error: rejects a current config under another commitment', async () => {
    await expect(
      Config.write(Store.memory(), {
        address,
        commitment: zeroCommitment,
        config: currentConfig,
      }),
    ).rejects.toMatchObject({
      name: 'Accounts.Config.InvalidStoreValueError',
      shortMessage: 'Stored account config is malformed or mismatched.',
    })
  })
})
