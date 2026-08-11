import { describe, expect, test } from 'vitest'
import { zeroAddress } from '../constants/address.js'
import type { Permission } from '../experimental/erc7715/types/permission.js'
import { toSessionPolicy, toSessionPolicyConfig } from './permissions.js'
import { defineSessionPolicy, encodeSessionPolicyConfig } from './policies.js'

const account = '0x0000000000000000000000000000000000000a11'
const usdc = '0x0000000000000000000000000000000000000a22'
const nft = '0x0000000000000000000000000000000000000b33'

const transfer = '0xa9059cbb'
const transferFrom = '0x23b872dd'

describe('toSessionPolicyConfig', () => {
  test('erc20-token-transfer → tokenLimit + transfer call scope', () => {
    const config = toSessionPolicyConfig([
      {
        type: 'erc20-token-transfer',
        data: { address: usdc, ticker: 'USDC' },
        policies: [
          { type: 'token-allowance', data: { allowance: 100_000_000n } },
        ],
      },
    ])
    expect(config).toEqual({
      tokenLimits: [{ token: usdc, limit: 100_000_000n, period: undefined }],
      callScopes: [
        {
          target: usdc,
          selectorRules: [{ selector: transfer }, { selector: transferFrom }],
        },
      ],
    })
  })

  test('rate-limit interval → recurring period (subscription)', () => {
    const config = toSessionPolicyConfig([
      {
        type: 'erc20-token-transfer',
        data: { address: usdc, ticker: 'USDC' },
        policies: [
          { type: 'token-allowance', data: { allowance: 100_000_000n } },
          { type: 'rate-limit', data: { count: 1, interval: 7 * 86400 } },
        ],
      },
    ])
    expect(config.tokenLimits?.[0]).toEqual({
      token: usdc,
      limit: 100_000_000n,
      period: 604_800n,
    })
  })

  test('native-token-transfer → native (zero address) tokenLimit', () => {
    const config = toSessionPolicyConfig([
      {
        type: 'native-token-transfer',
        data: { ticker: 'ETH' },
        policies: [
          { type: 'token-allowance', data: { allowance: 1_000_000_000n } },
        ],
      },
    ])
    expect(config.tokenLimits).toEqual([
      { token: zeroAddress, limit: 1_000_000_000n, period: undefined },
    ])
    expect(config.callScopes).toBeUndefined()
  })

  test('contract-call → call scope from signatures and raw selectors', () => {
    const config = toSessionPolicyConfig([
      {
        type: 'contract-call',
        data: { address: nft, calls: ['mint(address)', '0xDEADBEEF'] },
        policies: [],
      },
    ])
    expect(config).toEqual({
      tokenLimits: undefined,
      callScopes: [
        {
          target: nft,
          selectorRules: [
            { selector: '0x6a627842' },
            { selector: '0xdeadbeef' },
          ],
        },
      ],
    })
  })

  test('gas-limit policy is ignored (settled by payer layer)', () => {
    const config = toSessionPolicyConfig([
      {
        type: 'erc20-token-transfer',
        data: { address: usdc, ticker: 'USDC' },
        policies: [
          { type: 'token-allowance', data: { allowance: 5n } },
          { type: 'gas-limit', data: { limit: 21_000n } },
        ],
      },
    ])
    expect(config.tokenLimits).toEqual([
      { token: usdc, limit: 5n, period: undefined },
    ])
  })

  test('throws when a transfer permission has no allowance', () => {
    expect(() =>
      toSessionPolicyConfig([
        {
          type: 'erc20-token-transfer',
          data: { address: usdc, ticker: 'USDC' },
          policies: [],
        },
      ]),
    ).toThrow(/token-allowance/)
  })

  test('throws on a custom permission', () => {
    expect(() =>
      toSessionPolicyConfig([
        {
          type: { custom: 'anything' },
          data: {},
          policies: [],
        } as unknown as Permission,
      ]),
    ).toThrow(/custom ERC-7715 permission/)
  })

  test('throws on a custom policy', () => {
    expect(() =>
      toSessionPolicyConfig([
        {
          type: 'native-token-transfer',
          data: { ticker: 'ETH' },
          policies: [{ type: { custom: 'x' }, data: {} }],
        } as unknown as Permission,
      ]),
    ).toThrow(/custom ERC-7715 policy/)
  })
})

describe('toSessionPolicy', () => {
  test('binds permissions + expiry → SessionPolicy commitment', () => {
    const permissions: readonly Permission[] = [
      {
        type: 'erc20-token-transfer',
        data: { address: usdc, ticker: 'USDC' },
        policies: [
          { type: 'token-allowance', data: { allowance: 100_000_000n } },
        ],
      },
    ]
    const expiry = 1_800_000_000

    const session = toSessionPolicy({ account, permissions, expiry })

    // Equivalent to hand-binding the lowered config with validUntil = expiry.
    const expected = defineSessionPolicy({
      account,
      policyConfig: encodeSessionPolicyConfig(
        toSessionPolicyConfig(permissions),
      ),
      validUntil: BigInt(expiry),
    })

    expect(session.commitment).toBe(expected.commitment)
    expect(session.binding.validUntil).toBe(BigInt(expiry))
    expect(session.actorPolicy).toEqual(expected.actorPolicy)
  })
})
