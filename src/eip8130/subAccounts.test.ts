import { describe, expect, test } from 'vitest'
import { privateKeyToAccount } from '../accounts/privateKeyToAccount.js'
import { canonicalAuthenticators, scopeUnrestricted } from './constants.js'
import { key } from './keys.js'
import { fulfillAddSubAccount } from './subAccounts.js'

// Deterministic parent signer for stable addresses.
const parentSigner = privateKeyToAccount(`0x${'11'.repeat(32)}`)
const parent = parentSigner.address

const dappKey = '0x00000000000000000000000000000000000da990'
const salt = `0x${'aa'.repeat(32)}` as const

describe('fulfillAddSubAccount', () => {
  test('creates a distinct account controlled by the parent delegate', () => {
    const sub = fulfillAddSubAccount({
      parent,
      signer: parentSigner,
      proxy: 'erc1167',
      salt,
      keys: [{ publicKey: dappKey, type: 'address' }],
    })

    // Its own address (asset isolation), and the ERC-7895 response mirrors it.
    expect(sub.address).toMatch(/^0x[0-9a-fA-F]{40}$/)
    expect(sub.response.address).toBe(sub.address)

    // Parent is an unrestricted delegate actor; sub-account signs via delegate.
    expect(sub.parentActor).toEqual(key.delegate(parent))
    expect(sub.parentActor.authenticator).toBe(canonicalAuthenticators.delegate)
    expect(sub.actorId).toBe(key.delegate(parent).actorId)
    expect(sub.scope).toBe(scopeUnrestricted)

    // Owner set = parent delegate + requested key, and deployable via createChange.
    expect(sub.initialActors).toContainEqual(key.delegate(parent))
    expect(sub.initialActors).toContainEqual(key.k1(dappKey))
    expect(sub.createChange).toBeDefined()
  })

  test('initial actors are sorted by actorId ascending', () => {
    const sub = fulfillAddSubAccount({
      parent,
      signer: parentSigner,
      proxy: 'erc1167',
      salt,
      keys: [
        {
          publicKey: '0x00000000000000000000000000000000000000ff',
          type: 'address',
        },
        {
          publicKey: '0x0000000000000000000000000000000000000011',
          type: 'address',
        },
      ],
    })
    const ids = sub.initialActors.map((a) => BigInt(a.actorId as `0x${string}`))
    const sorted = [...ids].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    expect(ids).toEqual(sorted)
  })

  test('distinct salts yield distinct sub-accounts', () => {
    const a = fulfillAddSubAccount({
      parent,
      signer: parentSigner,
      proxy: 'erc1167',
      salt: `0x${'01'.repeat(32)}`,
    })
    const b = fulfillAddSubAccount({
      parent,
      signer: parentSigner,
      proxy: 'erc1167',
      salt: `0x${'02'.repeat(32)}`,
    })
    expect(a.address).not.toBe(b.address)
  })

  test('rejects a requested key that collides with the parent delegate', () => {
    expect(() =>
      fulfillAddSubAccount({
        parent,
        signer: parentSigner,
        proxy: 'erc1167',
        salt,
        // Same actorId as key.delegate(parent) (both derive from the parent address).
        keys: [{ publicKey: parent, type: 'address' }],
      }),
    ).toThrow(/Duplicate initial actor id/)
  })

  test('upgradeable proxy without an implementation throws (pending enshrinement)', () => {
    expect(() =>
      fulfillAddSubAccount({
        parent,
        signer: parentSigner,
        salt,
      }),
    ).toThrow(/UpgradeableAccount/)
  })
})
