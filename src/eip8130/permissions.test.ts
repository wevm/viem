import type { Abi } from 'abitype'
import { describe, expect, test } from 'vitest'
import { mainnet } from '../chains/index.js'
import { createClient } from '../clients/createClient.js'
import { custom } from '../clients/transports/custom.js'
import { zeroAddress } from '../constants/address.js'
import type { Permission } from '../experimental/erc7715/types/permission.js'
import { decodeFunctionData } from '../utils/abi/decodeFunctionData.js'
import { encodeFunctionResult } from '../utils/abi/encodeFunctionResult.js'
import { accountConfigurationAbi } from './abis.js'
import {
  actorScope,
  ecrecoverAuthenticator,
  externalPolicyAuthenticator,
  trustedExecutorAuthenticator,
} from './constants.js'
import { encodePolicyData, key } from './keys.js'
import {
  fulfillGrantPermissions,
  parsePermissionsContext,
  routePermissionedCalls,
  toSessionPolicy,
  toSessionPolicyConfig,
} from './permissions.js'
import {
  defineSessionPolicy,
  encodeSessionPolicyConfig,
  policyManagerAbi,
} from './policies.js'
import { actorIdFromAddress } from './utils/actorId.js'

/**
 * A client whose `eth_call` decodes `getActorConfig` and returns an actor with
 * the given `authenticator` (zero = unregistered).
 */
function actorConfigClient(authenticator: string) {
  return createClient({
    chain: mainnet,
    transport: custom({
      async request({ method, params }: { method: string; params: any }) {
        if (method === 'eth_chainId') return '0x1'
        if (method === 'eth_call') {
          const { functionName } = decodeFunctionData({
            abi: accountConfigurationAbi as Abi,
            data: params[0].data,
          })
          return encodeFunctionResult({
            abi: accountConfigurationAbi as Abi,
            functionName,
            result: { authenticator, expiry: 0, scope: 0 } as never,
          })
        }
        throw new Error(`unexpected RPC: ${method}`)
      },
    }),
  })
}

/** A client that throws on any request — proves no RPC was made. */
const throwingClient = createClient({
  chain: mainnet,
  transport: custom({
    async request() {
      throw new Error('no RPC expected')
    },
  }),
})

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

describe('fulfillGrantPermissions', () => {
  const permissions: readonly Permission[] = [
    {
      type: 'erc20-token-transfer',
      data: { address: usdc, ticker: 'USDC' },
      policies: [
        { type: 'token-allowance', data: { allowance: 100_000_000n } },
      ],
    },
  ]
  const grantee = '0x00000000000000000000000000000000000acce5'
  const expiry = 1_800_000_000

  test('session role → POLICY-only k1 actor, one expiry drives both surfaces', async () => {
    const client = actorConfigClient(trustedExecutorAuthenticator)
    const { actor, change, session } = await fulfillGrantPermissions(client, {
      account,
      grantee,
      permissions,
      expiry,
    })

    // k1 actor for the session key address.
    expect(actor).toEqual(key.k1(grantee))
    expect(change.authenticator).toBe(ecrecoverAuthenticator)
    expect(change.actorId).toBe(actorIdFromAddress(grantee))

    // POLICY-only, gated to the bound policy.
    expect(change.scope).toBe(actorScope.policy)
    expect(change.policyData).toBe(encodePolicyData(session.actorPolicy))

    // Single expiry → both the actor change and the policy binding.
    expect(change.expiry).toBe(BigInt(expiry))
    expect(session.binding.validUntil).toBe(BigInt(expiry))
  })

  test('manager not registered → managerChange folded into the batch', async () => {
    const client = actorConfigClient(zeroAddress)
    const { change, managerChange, changes, session } =
      await fulfillGrantPermissions(client, { account, grantee, permissions })

    // A trusted-executor registration for the manager is included first.
    expect(managerChange).toBeDefined()
    expect(managerChange?.authenticator).toBe(trustedExecutorAuthenticator)
    expect(managerChange?.actorId).toBe(actorIdFromAddress(session.manager))
    expect(managerChange?.scope).toBe(actorScope.sender)
    expect(managerChange?.policyData).toBeUndefined()

    expect(changes).toEqual([managerChange, change])
  })

  test('manager already registered → no managerChange', async () => {
    const client = actorConfigClient(trustedExecutorAuthenticator)
    const { change, managerChange, changes } = await fulfillGrantPermissions(
      client,
      { account, grantee, permissions },
    )
    expect(managerChange).toBeUndefined()
    expect(changes).toEqual([change])
  })

  test('assumeManagerRegistered skips the on-chain read', async () => {
    const { managerChange, changes, change } = await fulfillGrantPermissions(
      throwingClient,
      { account, grantee, permissions, assumeManagerRegistered: true },
    )
    expect(managerChange).toBeUndefined()
    expect(changes).toEqual([change])
  })

  test('pull role → external-pull sentinel actor + executeFor call', async () => {
    const client = actorConfigClient(trustedExecutorAuthenticator)
    const { actor, change, session } = await fulfillGrantPermissions(client, {
      account,
      grantee,
      role: 'pull',
      permissions,
      expiry,
    })

    // External-pull sentinel; actorId derived from the caller address.
    expect(actor).toEqual(key.externalPull(grantee))
    expect(change.authenticator).toBe(externalPolicyAuthenticator)
    expect(change.actorId).toBe(actorIdFromAddress(grantee))
    expect(change.scope).toBe(actorScope.policy)

    // The pull call targets the manager's `executeFor` entrypoint.
    const call = session.executeForCall({ target: usdc, data: '0x' })
    expect(call.to).toBe(session.manager)
    const decoded = decodeFunctionData({
      abi: policyManagerAbi,
      data: call.data!,
    })
    expect(decoded.functionName).toBe('executeFor')
  })

  test('returns a permissionsContext that round-trips', async () => {
    const client = actorConfigClient(trustedExecutorAuthenticator)
    const { permissionsContext, session, actor } =
      await fulfillGrantPermissions(client, {
        account,
        grantee,
        permissions,
        expiry,
      })

    const parsed = parsePermissionsContext(permissionsContext)
    expect(parsed.account).toBe(account)
    expect(parsed.role).toBe('session')
    expect(parsed.actor).toEqual(actor)
    // Rebound policy recomputes the identical commitment.
    expect(parsed.session.commitment).toBe(session.commitment)
    expect(parsed.session.binding.validUntil).toBe(BigInt(expiry))
  })
})

describe('routePermissionedCalls', () => {
  const permissions: readonly Permission[] = [
    {
      type: 'erc20-token-transfer',
      data: { address: usdc, ticker: 'USDC' },
      policies: [
        { type: 'token-allowance', data: { allowance: 100_000_000n } },
      ],
    },
  ]

  test('session context → calls routed through PolicyManager.execute', async () => {
    const client = actorConfigClient(trustedExecutorAuthenticator)
    const { permissionsContext, session } = await fulfillGrantPermissions(
      client,
      {
        account,
        grantee: '0x00000000000000000000000000000000000acce5',
        permissions,
      },
    )

    const routed = routePermissionedCalls({
      context: permissionsContext,
      calls: [{ target: usdc, data: '0x' }],
    })
    expect(routed.role).toBe('session')
    expect(routed.calls).toHaveLength(1)
    expect(routed.calls[0]!.to).toBe(session.manager)
    expect(
      decodeFunctionData({
        abi: policyManagerAbi,
        data: routed.calls[0]!.data!,
      }).functionName,
    ).toBe('execute')
  })

  test('pull context → calls routed through PolicyManager.executeFor', async () => {
    const client = actorConfigClient(trustedExecutorAuthenticator)
    const { permissionsContext } = await fulfillGrantPermissions(client, {
      account,
      grantee: '0x00000000000000000000000000000000000acce5',
      role: 'pull',
      permissions,
    })

    const routed = routePermissionedCalls({
      context: permissionsContext,
      calls: [{ target: usdc, data: '0x' }],
    })
    expect(routed.role).toBe('pull')
    expect(
      decodeFunctionData({
        abi: policyManagerAbi,
        data: routed.calls[0]!.data!,
      }).functionName,
    ).toBe('executeFor')
  })
})
