import { describe, expect, test } from 'vitest'
import { accounts } from '~test/constants.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { sliceHex } from '../../../utils/data/slice.js'
import { recoverAddress } from '../../../utils/signature/recoverAddress.js'
import { ecrecoverAuthenticator } from '../constants.js'
import type { AaChange } from '../types/transaction.js'
import { actorIdFromAddress } from './actorId.js'
import { hashAccountChanges } from './hashActorChanges.js'
import { signAccountChanges } from './signActorChanges.js'

const signer = privateKeyToAccount(accounts[0].privateKey)
const account = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const

const authorize: AaChange = {
  changeType: 0x00,
  actorId: '0x0000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc',
  authenticator: '0x0000000000000000000000000000000000000001',
  scope: 0x04,
  expiry: 1_900_000_000n,
}
const revoke: AaChange = {
  changeType: 0x01,
  actorId: '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
}

describe('actorIdFromAddress', () => {
  test('left-aligned bytes32(bytes20(address))', () => {
    expect(
      actorIdFromAddress('0x0000000000000000000000000000000000000001'),
    ).toBe('0x0000000000000000000000000000000000000001000000000000000000000000')
    expect(actorIdFromAddress(account).toLowerCase()).toBe(
      `0x${account.slice(2).toLowerCase()}000000000000000000000000`,
    )
  })
})

describe('hashAccountChanges (EIP-8130)', () => {
  test('deterministic 32-byte digest', () => {
    const digest = hashAccountChanges({
      account,
      chainId: 0,
      sequence: 1,
      changes: [authorize, revoke],
    })
    expect(digest).toMatch(/^0x[0-9a-f]{64}$/)
    expect(
      hashAccountChanges({
        account,
        chainId: 0,
        sequence: 1,
        changes: [authorize, revoke],
      }),
    ).toBe(digest)
  })

  test('sequence and account are bound', () => {
    const base = { account, chainId: 0, changes: [authorize] } as const
    expect(hashAccountChanges({ ...base, sequence: 1 })).not.toBe(
      hashAccountChanges({ ...base, sequence: 2 }),
    )
    expect(hashAccountChanges({ ...base, sequence: 1 })).not.toBe(
      hashAccountChanges({
        account: '0x0000000000000000000000000000000000000009',
        chainId: 0,
        sequence: 1,
        changes: [authorize],
      }),
    )
  })
})

describe('signAccountChanges (EIP-8130)', () => {
  test('returns a config entry whose signature recovers the signer', async () => {
    const entry = await signAccountChanges({
      signer,
      account,
      channel: 'multichain',
      chainId: 0,
      sequence: 1n,
      changes: [authorize, revoke],
    })

    expect(entry.type).toBe('config')
    expect(entry.channel).toBe('multichain')
    expect(entry.sequence).toBe(1n)
    expect(sliceHex(entry.signature, 0, 20)).toBe(ecrecoverAuthenticator)

    // 'multichain' binds chainId 0 in the digest.
    const digest = hashAccountChanges({
      account,
      chainId: 0,
      sequence: 1,
      changes: [authorize, revoke],
    })
    const recovered = await recoverAddress({
      hash: digest,
      signature: sliceHex(entry.signature, 20),
    })
    expect(recovered.toLowerCase()).toBe(signer.address.toLowerCase())
  })

  test('defaults account to signer address, local channel binds chainId', async () => {
    const entry = await signAccountChanges({
      signer,
      channel: 'local',
      chainId: 8453,
      sequence: 3n,
      changes: [revoke],
    })
    const digest = hashAccountChanges({
      account: signer.address,
      chainId: 8453,
      sequence: 3,
      changes: [revoke],
    })
    const recovered = await recoverAddress({
      hash: digest,
      signature: sliceHex(entry.signature, 20),
    })
    expect(recovered.toLowerCase()).toBe(signer.address.toLowerCase())
  })
})
