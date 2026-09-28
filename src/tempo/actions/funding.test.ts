import { FundingPolicy } from 'ox/tempo'
import {
  createClient,
  encodeAbiParameters,
  http,
  parseAbi,
  parseAbiParameters,
  toEventSelector,
} from 'viem'
import { describe, expect, test } from 'vitest'
import { decodeFunctionData } from '../../utils/abi/decodeFunctionData.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import {
  createPolicy,
  discover,
  setPolicyAdmins,
  setPolicyRules,
} from './funding.js'

describe('discover.call', () => {
  test('encodes decoded policy rules', () => {
    const rules = {
      maxSlippageBps: 100,
      sources: {
        [Addresses.pathUsd]: [
          { target: Addresses.dexFundingSource, data: '0x1234' },
        ],
      },
    } as const
    const parameters = {
      account: '0x0000000000000000000000000000000000000001',
      amount: 50_000_000n,
      policyId: 1n,
      token: Addresses.pathUsd,
    } as const

    expect(discover.call({ ...parameters, policyRules: rules }).data).toBe(
      discover.call({ ...parameters, policyRules: FundingPolicy.encode(rules) })
        .data,
    )
  })

  test('discovers without a stored policy', () => {
    const call = discover.call({
      account: '0x0000000000000000000000000000000000000001',
      amount: 50_000_000n,
      slippageBps: 100,
      sources: [{ target: Addresses.dexFundingSource, data: '0x1234' }],
      token: Addresses.pathUsd,
    })

    expect(call.to).toBe(Addresses.fundingDiscovery)
    expect(call.data.slice(0, 10)).toBe('0x6a67e281')
    expect(
      decodeFunctionData({ abi: Abis.fundingDiscovery, data: call.data }).args,
    ).toEqual([
      '0x0000000000000000000000000000000000000001',
      '0x20C0000000000000000000000000000000000000',
      50_000_000n,
      100,
      [{ target: Addresses.dexFundingSource, data: '0x1234' }],
    ])
  })

  test.each([0n, 1n])('checks a supplied policy ID (%s)', (policyId) => {
    const call = discover.call({
      account: '0x0000000000000000000000000000000000000001',
      amount: 50_000_000n,
      policyId,
      policyRules: '0x1234',
      token: Addresses.pathUsd,
    })

    expect(call.data.slice(0, 10)).toBe('0x6add729d')
    expect(
      decodeFunctionData({ abi: Abis.fundingDiscovery, data: call.data }).args,
    ).toEqual([
      '0x0000000000000000000000000000000000000001',
      '0x20C0000000000000000000000000000000000000',
      50_000_000n,
      policyId,
      '0x1234',
    ])
  })
})

describe('setPolicyAdmins.call', () => {
  test('encodes the policy precompile call', () => {
    const call = setPolicyAdmins.call({
      policyId: 1n,
      admins: [Addresses.pathUsd],
    })
    expect(
      decodeFunctionData({ abi: Abis.fundingPolicy, data: call.data }),
    ).toEqual({
      functionName: 'setAdmins',
      args: [1n, ['0x20C0000000000000000000000000000000000000']],
    })
  })
})

describe('setPolicyRules.call', () => {
  test('encodes the policy precompile call', () => {
    const call = setPolicyRules.call({
      policyId: 1n,
      rules: { maxSlippageBps: 100, sources: {} },
    })
    expect(
      decodeFunctionData({ abi: Abis.fundingPolicy, data: call.data }),
    ).toEqual({
      functionName: 'setRules',
      args: [1n, { enforceOrder: false, maxSlippageBps: 100, routes: [] }],
    })
  })
})

describe('discover', () => {
  test('rejects a missing account', async () => {
    await expect(
      discover(createClient({ transport: http('http://localhost:9546') }), {
        amount: 1n,
        slippageBps: 0,
        sources: [],
        token: Addresses.pathUsd,
      } as never),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [AccountNotFoundError: Could not find an Account to execute with this Action.
      Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

      Version: viem@x.y.z]
    `)
  })
})

for (const [enforceOrder, expected] of [
  [undefined, false],
  [false, false],
  [true, true],
] as const) {
  test(`policy calls preserve enforceOrder (${enforceOrder})`, () => {
    const rules = { enforceOrder, maxSlippageBps: 100, sources: {} }
    const abi = parseAbi([
      'function createPolicy(address[] admins, (uint16 maxSlippageBps, (address token, (address target, bytes data)[] sources)[] routes, bool enforceOrder) rules) returns (uint64)',
      'function setRules(uint64 policyId, (uint16 maxSlippageBps, (address token, (address target, bytes data)[] sources)[] routes, bool enforceOrder) rules)',
    ])
    expect(
      decodeFunctionData({
        abi,
        data: createPolicy.call({ admins: [Addresses.pathUsd], rules }).data,
      }),
    ).toEqual({
      functionName: 'createPolicy',
      args: [
        ['0x20C0000000000000000000000000000000000000'],
        { maxSlippageBps: 100, routes: [], enforceOrder: expected },
      ],
    })
    expect(
      decodeFunctionData({
        abi,
        data: setPolicyRules.call({ policyId: 1n, rules }).data,
      }),
    ).toEqual({
      functionName: 'setRules',
      args: [1n, { maxSlippageBps: 100, routes: [], enforceOrder: expected }],
    })
  })
}

for (const [eventName, action] of [
  ['PolicyCreated', createPolicy],
  ['PolicyRulesUpdated', setPolicyRules],
] as const) {
  test.each([false, true])(
    `${eventName} preserves enforceOrder (%s)`,
    (enforceOrder) => {
      const abi = parseAbi([
        'event PolicyCreated(uint64 indexed policyId, address indexed updater, bytes32 rulesHash, (uint16 maxSlippageBps, (address token, (address target, bytes data)[] sources)[] routes, bool enforceOrder) rules)',
        'event PolicyRulesUpdated(uint64 indexed policyId, address indexed updater, bytes32 rulesHash, (uint16 maxSlippageBps, (address token, (address target, bytes data)[] sources)[] routes, bool enforceOrder) rules)',
      ])
      const rulesHash = `0x${'11'.repeat(32)}` as const
      const event = action.extractEvent([
        {
          address: Addresses.fundingPolicy,
          blockHash: null,
          blockNumber: null,
          data: encodeAbiParameters(
            parseAbiParameters(
              'bytes32, (uint16 maxSlippageBps, (address token, (address target, bytes data)[] sources)[] routes, bool enforceOrder)',
            ),
            [rulesHash, { maxSlippageBps: 100, routes: [], enforceOrder }],
          ),
          logIndex: null,
          removed: false,
          topics: [
            toEventSelector(abi[eventName === 'PolicyCreated' ? 0 : 1]),
            encodeAbiParameters(parseAbiParameters('uint64'), [1n]),
            encodeAbiParameters(parseAbiParameters('address'), [
              Addresses.pathUsd,
            ]),
          ],
          transactionHash: null,
          transactionIndex: null,
        },
      ])
      expect(event.args).toEqual({
        policyId: 1n,
        updater: '0x20C0000000000000000000000000000000000000',
        rulesHash,
        rules: { enforceOrder, maxSlippageBps: 100, sources: {} },
      })
    },
  )
}
