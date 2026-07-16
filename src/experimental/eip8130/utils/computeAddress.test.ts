import { describe, expect, test } from 'vitest'
import { getCreate2Address } from '../../../utils/address/getContractAddress.js'
import { isAddress } from '../../../utils/address/isAddress.js'
import { concatHex } from '../../../utils/data/concat.js'
import { toHex } from '../../../utils/encoding/toHex.js'
import { keccak256 } from '../../../utils/hash/keccak256.js'
import { accountConfigAddress } from '../constants.js'
import type { AaActor } from '../types/transaction.js'
import { computeAddress8130, deploymentHeader } from './computeAddress.js'

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
    const address = computeAddress8130(params)
    expect(isAddress(address)).toBe(true)
    expect(computeAddress8130(params)).toBe(address)
  })

  test('matches manual CREATE2 derivation', () => {
    const userSalt =
      '0x00000000000000000000000000000000000000000000000000000000000000aa' as const
    const code = '0x6080' as const
    const actorsCommitment = keccak256(
      concatHex([
        actorA.actorId,
        actorA.authenticator,
        toHex(actorA.scope ?? 0, { size: 1 }),
        actorA.policyData ?? '0x',
        actorB.actorId,
        actorB.authenticator,
        toHex(actorB.scope ?? 0, { size: 1 }),
        actorB.policyData ?? '0x',
      ]),
    )
    const effectiveSalt = keccak256(concatHex([userSalt, actorsCommitment]))
    const deploymentCode = concatHex([deploymentHeader(2), code])
    const expected = getCreate2Address({
      from: accountConfigAddress,
      salt: effectiveSalt,
      bytecode: deploymentCode,
    })
    expect(
      computeAddress8130({ userSalt, code, initialActors: [actorA, actorB] }),
    ).toBe(expected)
  })

  test('different salt yields different address', () => {
    const base = { code: '0x6080', initialActors: [actorA] } as const
    const a = computeAddress8130({
      ...base,
      userSalt:
        '0x0000000000000000000000000000000000000000000000000000000000000001',
    })
    const b = computeAddress8130({
      ...base,
      userSalt:
        '0x0000000000000000000000000000000000000000000000000000000000000002',
    })
    expect(a).not.toBe(b)
  })

  test('custom accountConfigAddress changes the address', () => {
    const base = {
      userSalt:
        '0x0000000000000000000000000000000000000000000000000000000000000001',
      code: '0x6080',
      initialActors: [actorA],
    } as const
    const a = computeAddress8130(base)
    const b = computeAddress8130({
      ...base,
      accountConfigAddress: '0x00000000000000000000000000000000000000ff',
    })
    expect(a).not.toBe(b)
  })

  test('deploymentHeader encodes code length into PUSH2 operands', () => {
    expect(deploymentHeader(2)).toBe('0x610002600e60003961000260' + '00f3')
    expect(deploymentHeader(0x1234)).toBe('0x611234600e6000396112346000f3')
  })

  test('rejects unsorted / duplicate actors', () => {
    expect(() =>
      computeAddress8130({
        userSalt:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        code: '0x6080',
        initialActors: [actorB, actorA],
      }),
    ).toThrowError()
    expect(() =>
      computeAddress8130({
        userSalt:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        code: '0x6080',
        initialActors: [actorA, actorA],
      }),
    ).toThrowError()
  })

  test('rejects empty code', () => {
    expect(() =>
      computeAddress8130({
        userSalt:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        code: '0x',
        initialActors: [actorA],
      }),
    ).toThrowError()
  })
})
