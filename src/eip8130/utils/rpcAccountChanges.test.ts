import { describe, expect, test } from 'vitest'
import { changeType } from '../constants.js'
import type { AaAccountChange } from '../types/transaction.js'
import {
  fromRpcAccountChange,
  toRpcAccountChange,
} from './rpcAccountChanges.js'

const actorId = `0x${'11'.repeat(32)}` as const
const authenticator = '0x0000000000000000000000000000000000000001' as const

const delegation: AaAccountChange = {
  type: 'delegation',
  target: '0x00000000000000000000000000000000000000aa',
}
const create: AaAccountChange = {
  type: 'create',
  userSalt: `0x${'22'.repeat(32)}`,
  code: '0x',
  initialActors: [{ actorId, authenticator }],
}
const config: AaAccountChange = {
  type: 'config',
  channel: 'local',
  sequence: 3n,
  changes: [
    { changeType: changeType.authorizeActor, actorId, authenticator, scope: 1 },
    { changeType: changeType.revokeActor, actorId },
    { changeType: changeType.incrementLocalEpoch },
  ],
  signature: '0xdead',
}

describe('toRpcAccountChange', () => {
  test('tags entries by type byte', () => {
    expect(toRpcAccountChange(delegation).type).toBe('0x1')
    expect(toRpcAccountChange(create).type).toBe('0x2')
    expect(toRpcAccountChange(config).type).toBe('0x3')
  })

  test('create: always sends scope and policyData', () => {
    expect(toRpcAccountChange(create)).toMatchInlineSnapshot(`
      {
        "code": "0x",
        "initialActors": [
          {
            "actorId": "0x1111111111111111111111111111111111111111111111111111111111111111",
            "authenticator": "0x0000000000000000000000000000000000000001",
            "policyData": "0x",
            "scope": "0x0",
          },
        ],
        "type": "0x2",
        "userSalt": "0x2222222222222222222222222222222222222222222222222222222222222222",
      }
    `)
  })

  test('config: channel and ops are wire bytes, sequence a quantity', () => {
    const rpc = toRpcAccountChange(config)
    expect(rpc.channel).toBe('0x0')
    expect(rpc.sequence).toBe('0x3')
    expect(
      (rpc.changes as { changeType: string }[]).map((c) => c.changeType),
    ).toEqual(['0x0', '0x1', '0x2'])
    expect(
      toRpcAccountChange({ ...config, channel: 'multichain' }).channel,
    ).toBe('0x1')
  })
})

describe('fromRpcAccountChange', () => {
  test('round-trips every entry type', () => {
    for (const change of [delegation, create, config])
      expect(fromRpcAccountChange(toRpcAccountChange(change))).toEqual(change)
  })

  test('accepts padded type bytes', () => {
    expect(
      fromRpcAccountChange({ ...toRpcAccountChange(delegation), type: '0x01' }),
    ).toEqual(delegation)
  })

  test('accepts the legacy names and JSON numbers of older nodes', () => {
    const rpcCreate = toRpcAccountChange(create)
    const rpcConfig = toRpcAccountChange(config)
    expect(
      fromRpcAccountChange({
        ...toRpcAccountChange(delegation),
        type: 'delegation',
      }),
    ).toEqual(delegation)
    expect(
      fromRpcAccountChange({
        ...rpcCreate,
        type: 'create',
        initialActors: [{ actorId, authenticator, scope: 0, policyData: '0x' }],
      }),
    ).toEqual(create)
    expect(
      fromRpcAccountChange({
        ...rpcConfig,
        type: 'configChange',
        channel: 'Local',
        sequence: 3,
        changes: (rpcConfig.changes as { payload: string }[]).map((c, i) => ({
          ...c,
          changeType: ['AuthorizeActor', 'RevokeActor', 'IncrementLocalEpoch'][
            i
          ],
        })),
      }),
    ).toEqual(config)
  })

  test('rejects unknown ops', () => {
    expect(() =>
      fromRpcAccountChange({
        ...toRpcAccountChange(config),
        changes: [{ changeType: 'Frobnicate', payload: '0x' }],
      }),
    ).toThrow('Unknown account change op: "Frobnicate".')
  })

  test('rejects unknown entry types', () => {
    expect(() => fromRpcAccountChange({ type: '0x9' })).toThrow(
      'Unknown account change entry type: "0x9".',
    )
  })
})
