import { MultisigConfig } from 'ox/tempo'
import { describe, expect, test } from 'vitest'
import { getMultisigSimulation, parseMultisigApproval } from './multisig.js'

const owners = [1, 2, 3, 4, 5].map((n) => ({
  owner: `0x${n.toString().padStart(40, '0')}` as `0x${string}`,
  weight: n === 1 ? 4 : 1,
}))

describe('getMultisigSimulation', () => {
  test('models the largest quorum, even when the first owner alone meets the threshold', () => {
    const config = MultisigConfig.from({ owners, threshold: 4 })
    expect(getMultisigSimulation(config)).toEqual({
      config,
      approvals: owners.slice(1).map(({ owner }) => ({ owner })),
    })
  })

  test('does not append approvals after reaching quorum', () => {
    const config = MultisigConfig.from({ owners, threshold: 2 })
    expect(getMultisigSimulation(config).approvals).toEqual([
      { owner: owners[1]!.owner },
      { owner: owners[2]!.owner },
    ])
  })
})

describe('parseMultisigApproval', () => {
  test('rejects a malformed approval', () => {
    expect(() => parseMultisigApproval('0x')).toThrow()
  })
})
