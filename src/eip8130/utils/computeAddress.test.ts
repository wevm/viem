import { describe, expect, test } from 'vitest'
import { getCreate2Address } from '../../utils/address/getContractAddress.js'
import { isAddress } from '../../utils/address/isAddress.js'
import { concatHex } from '../../utils/data/concat.js'
import { toHex } from '../../utils/encoding/toHex.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import { keystoreAddress } from '../constants.js'
import type { AaActor } from '../types/transaction.js'
import { computeAddress, deploymentHeader } from './computeAddress.js'

const actorA: AaActor = {
  actorId: '0x0000000000000000000000000000000000000000000000000000000000000001',
  authenticator: '0x0000000000000000000000000000000000000001',
}
const actorB: AaActor = {
  actorId: '0x0000000000000000000000000000000000000000000000000000000000000002',
  authenticator: '0x0000000000000000000000000000000000000002',
}

describe('computeAddress (EIP-8130)', () => {
  test('deterministic + valid checksum address', () => {
    const params = {
      userSalt:
        '0x0000000000000000000000000000000000000000000000000000000000000001',
      code: '0x6080604052',
      initialActors: [actorA, actorB],
    } as const
    const address = computeAddress(params)
    expect(isAddress(address)).toBe(true)
    expect(computeAddress(params)).toBe(address)
  })

  test('matches manual CREATE2 derivation', () => {
    const userSalt =
      '0x00000000000000000000000000000000000000000000000000000000000000aa' as const
    const code = '0x6080' as const
    // Leaves-then-list commitment (EIP-8130 `_computeActorsCommitment`): each
    // actor hashes into a leaf `keccak256(actorId || authenticator ||
    // scope(2 BE) || policyData)`, then the packed leaves are hashed once.
    const leaf = (actor: AaActor) =>
      keccak256(
        concatHex([
          actor.actorId,
          actor.authenticator,
          toHex(actor.scope ?? 0, { size: 2 }),
          actor.policyData ?? '0x',
        ]),
      )
    const actorsCommitment = keccak256(concatHex([leaf(actorA), leaf(actorB)]))
    const effectiveSalt = keccak256(concatHex([userSalt, actorsCommitment]))
    const deploymentCode = concatHex([deploymentHeader(2), code])
    const expected = getCreate2Address({
      from: keystoreAddress,
      salt: effectiveSalt,
      bytecode: deploymentCode,
    })
    expect(
      computeAddress({ userSalt, code, initialActors: [actorA, actorB] }),
    ).toBe(expected)
  })

  test('different salt yields different address', () => {
    const base = { code: '0x6080', initialActors: [actorA] } as const
    const a = computeAddress({
      ...base,
      userSalt:
        '0x0000000000000000000000000000000000000000000000000000000000000001',
    })
    const b = computeAddress({
      ...base,
      userSalt:
        '0x0000000000000000000000000000000000000000000000000000000000000002',
    })
    expect(a).not.toBe(b)
  })

  test('deploymentHeader encodes code length into PUSH2 operands', () => {
    expect(deploymentHeader(2)).toBe('0x610002600e60003961000260' + '00f3')
    expect(deploymentHeader(0x1234)).toBe('0x611234600e6000396112346000f3')
  })

  test('rejects unsorted / duplicate actors', () => {
    expect(() =>
      computeAddress({
        userSalt:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        code: '0x6080',
        initialActors: [actorB, actorA],
      }),
    ).toThrowError()
    expect(() =>
      computeAddress({
        userSalt:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        code: '0x6080',
        initialActors: [actorA, actorA],
      }),
    ).toThrowError()
  })

  test('rejects empty code', () => {
    expect(() =>
      computeAddress({
        userSalt:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        code: '0x',
        initialActors: [actorA],
      }),
    ).toThrowError()
  })
})
