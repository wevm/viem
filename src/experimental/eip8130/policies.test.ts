import { describe, expect, test } from 'vitest'
import { decodeFunctionData } from '../../utils/abi/decodeFunctionData.js'
import { baseSepoliaDeployment } from './deployments.js'
import {
  commitmentOf,
  defineSessionPolicy,
  encodeSessionPolicyAction,
  encodeSessionPolicyConfig,
  type PolicyBinding,
  policyManagerAbi,
  sessionPolicyAddress,
} from './policies.js'

const account = '0x0000000000000000000000000000000000000a11'
const token = '0x0000000000000000000000000000000000000a22'
const policy = sessionPolicyAddress

// ≤ 100 USDC / week, only `transfer` on the token.
const config = encodeSessionPolicyConfig({
  tokenLimits: [{ token, limit: 100_000_000n, period: 604_800n }],
  callScopes: [{ target: token, selectorRules: [{ selector: '0xa9059cbb' }] }],
})

const binding: PolicyBinding = {
  account,
  policy,
  policyConfig: config,
  validAfter: 0n,
  validUntil: 0n,
  salt: 0n,
}

describe('encoders', () => {
  test('encodeSessionPolicyConfig matches abi.encode(Config)', () => {
    // Reference vector via `cast abi-encode` of the SessionPolicy Config tuple.
    expect(config).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000a220000000000000000000000000000000000000000000000000000000005f5e1000000000000000000000000000000000000000000000000000000000000093a80000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000a22000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020a9059cbb0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000',
    )
  })

  test('encodeSessionPolicyAction matches abi.encode(Action)', () => {
    expect(
      encodeSessionPolicyAction({ target: token, data: '0xa9059cbb' }),
    ).toBe(
      '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000a22000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004a9059cbb00000000000000000000000000000000000000000000000000000000',
    )
  })
})

describe('commitmentOf', () => {
  test('matches PolicyManager.commitmentOf reference vector', () => {
    expect(commitmentOf(binding)).toBe(
      '0x99f5258c7da5ed6dcc01fcc552cdfc1a69369487bcfaa4f623e6e37f6780e8e7',
    )
  })

  test('salt changes the commitment', () => {
    expect(commitmentOf({ ...binding, salt: 1n })).not.toBe(
      commitmentOf(binding),
    )
  })
})

describe('defineSessionPolicy', () => {
  const session = defineSessionPolicy({ account, policyConfig: config })

  test('defaults policy + manager to the Base Sepolia deployment', () => {
    expect(session.policy).toBe(baseSepoliaDeployment.policies.sessionPolicy)
    expect(session.manager).toBe(baseSepoliaDeployment.policies.manager)
  })

  test('actorPolicy carries type, manager, commitment', () => {
    expect(session.actorPolicy).toEqual({
      type: 1,
      manager: baseSepoliaDeployment.policies.manager,
      commitment: commitmentOf(binding),
    })
    expect(session.commitment).toBe(commitmentOf(binding))
  })

  test('rejects a zero policyType', () => {
    expect(() =>
      defineSessionPolicy({ account, policyConfig: config, policyType: 0 }),
    ).toThrow()
  })

  test('executeCall encodes PolicyManager.execute(binding, executionData)', () => {
    const action = encodeSessionPolicyAction({
      target: token,
      data: '0xa9059cbb',
    })
    const call = session.executeCall(action)
    expect(call.to).toBe(baseSepoliaDeployment.policies.manager)
    const { functionName, args } = decodeFunctionData({
      abi: policyManagerAbi,
      data: call.data!,
    })
    expect(functionName).toBe('execute')
    // #43: the full binding is passed at execute (not just the policy address).
    // uint40 fields decode to `number`; uint256 (salt) to `bigint`.
    expect(args).toEqual([{ ...binding, validAfter: 0, validUntil: 0 }, action])
  })
})
