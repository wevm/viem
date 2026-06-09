import { describe, expect, test } from 'vitest'
import { accounts } from '~test/constants.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { sliceHex } from '../../../utils/data/slice.js'
import { recoverAddress } from '../../../utils/signature/recoverAddress.js'
import { ecrecoverAuthenticator } from '../constants.js'
import type { AaActorChange } from '../types/transaction.js'
import { actorIdFromAddress } from './actorId.js'
import { hashActorChanges8130 } from './hashActorChanges.js'
import { signActorChanges8130 } from './signActorChanges.js'

const signer = privateKeyToAccount(accounts[0].privateKey)
const account = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const

const authorize: AaActorChange = {
  changeType: 0x01,
  actorId: '0x0000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc',
  authenticator: '0x0000000000000000000000000000000000000001',
  scope: 0x04,
  expiry: 1_900_000_000n,
}
const revoke: AaActorChange = {
  changeType: 0x02,
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

describe('hashActorChanges (EIP-8130)', () => {
  test('deterministic 32-byte digest', () => {
    const digest = hashActorChanges8130({
      account,
      chainId: 0,
      sequence: 1,
      actorChanges: [authorize, revoke],
    })
    expect(digest).toMatch(/^0x[0-9a-f]{64}$/)
    expect(
      hashActorChanges8130({
        account,
        chainId: 0,
        sequence: 1,
        actorChanges: [authorize, revoke],
      }),
    ).toBe(digest)
  })

  test('sequence and account are bound', () => {
    const base = { account, chainId: 0, actorChanges: [authorize] } as const
    expect(hashActorChanges8130({ ...base, sequence: 1 })).not.toBe(
      hashActorChanges8130({ ...base, sequence: 2 }),
    )
    expect(hashActorChanges8130({ ...base, sequence: 1 })).not.toBe(
      hashActorChanges8130({
        account: '0x0000000000000000000000000000000000000009',
        chainId: 0,
        sequence: 1,
        actorChanges: [authorize],
      }),
    )
  })
})

describe('signActorChanges (EIP-8130)', () => {
  test('returns a config entry whose auth recovers the signer', async () => {
    const entry = await signActorChanges8130({
      signer,
      account,
      chainId: 0,
      sequence: 1,
      actorChanges: [authorize, revoke],
    })

    expect(entry.type).toBe('config')
    expect(entry.chainId).toBe(0)
    expect(entry.sequence).toBe(1)
    expect(sliceHex(entry.auth, 0, 20)).toBe(ecrecoverAuthenticator)

    const digest = hashActorChanges8130({
      account,
      chainId: 0,
      sequence: 1,
      actorChanges: [authorize, revoke],
    })
    const recovered = await recoverAddress({
      hash: digest,
      signature: sliceHex(entry.auth, 20),
    })
    expect(recovered.toLowerCase()).toBe(signer.address.toLowerCase())
  })

  test('defaults account to signer address', async () => {
    const entry = await signActorChanges8130({
      signer,
      chainId: 0,
      sequence: 3,
      actorChanges: [revoke],
    })
    const digest = hashActorChanges8130({
      account: signer.address,
      chainId: 0,
      sequence: 3,
      actorChanges: [revoke],
    })
    const recovered = await recoverAddress({
      hash: digest,
      signature: sliceHex(entry.auth, 20),
    })
    expect(recovered.toLowerCase()).toBe(signer.address.toLowerCase())
  })
})
