import * as Hex from 'ox/Hex'
import * as RpcResponse from 'ox/RpcResponse'
import {
  FundingPolicy,
  type FundingRequirement,
  KeyAuthorization,
} from 'ox/tempo'
import { getChainId } from '../../actions/public/getChainId.js'
import type { Client } from '../../clients/createClient.js'
import type { BaseError } from '../../errors/base.js'
import * as Abis from '../Abis.js'
import type { RpcSchema } from '../Funding.js'

export const fundingErrors = [
  ...Abis.accountKeychain,
  ...Abis.earnFundingSource,
  ...Abis.fundingPolicy,
  ...Abis.fundingSource,
  ...Abis.stablecoinDex,
  ...Abis.tip20Funder,
  ...Abis.tip403Registry,
].filter((item) => item.type === 'error')

export type FundingRequirementInput<quantity = bigint, index = number> = Omit<
  FundingRequirement.FundingRequirement<quantity, index>,
  'policyRules'
> & {
  /** Complete policy rules, decoded or ABI-encoded. */
  policyRules?: FundingPolicy.Rules | Hex.Hex | undefined
}

type NormalizedFundingRequirement<quantity, index> = Omit<
  FundingRequirementIntent<quantity, index>,
  'policyRules'
> & { policyRules?: Hex.Hex | undefined }

/** Funding intent accepted before the relay resolves sources. */
export type FundingRequirementIntent<quantity = bigint, index = number> = Omit<
  FundingRequirementInput<quantity, index>,
  'sources'
> & {
  /** Omit to discover sources through a funding relay. */
  sources?: FundingRequirementInput<quantity, index>['sources'] | undefined
}

export function normalizeRequireFunds<quantity, index>(
  requirements: readonly FundingRequirementInput<quantity, index>[] | undefined,
  ownerAuthorized?: boolean,
): readonly FundingRequirement.FundingRequirement<quantity, index>[] | undefined
export function normalizeRequireFunds<quantity, index>(
  requirements:
    | readonly FundingRequirementIntent<quantity, index>[]
    | undefined,
  ownerAuthorized?: boolean,
): readonly NormalizedFundingRequirement<quantity, index>[] | undefined
export function normalizeRequireFunds<quantity, index>(
  requirements:
    | readonly FundingRequirementIntent<quantity, index>[]
    | undefined,
  ownerAuthorized = false,
): readonly NormalizedFundingRequirement<quantity, index>[] | undefined {
  return requirements?.map(({ policyRules, ...requirement }) => {
    if (policyRules === undefined || ownerAuthorized) return requirement
    return {
      ...requirement,
      policyRules:
        typeof policyRules === 'string'
          ? policyRules
          : FundingPolicy.encode(policyRules),
    }
  })
}

/** Registers rule content with a local handler or remote relay before submission. */
export async function registerPolicyRules(
  client: Client,
  parameters: {
    chainId?: number | undefined
    rules: FundingPolicy.Rules
  },
) {
  const { rules } = parameters
  const chainId =
    parameters.chainId ?? client.chain?.id ?? (await getChainId(client))
  try {
    await client.request<RpcSchema[0]>({
      method: 'funding_registerPolicyRules',
      params: [
        {
          chainId: Hex.fromNumber(chainId),
          rules: FundingPolicy.encode(rules),
        },
      ],
    })
  } catch (error) {
    // Ordinary node transports do not provide relay storage. Other failures must
    // stop submission so callers know the rules were not registered.
    const name = (error as BaseError).name
    if (
      name !== 'MethodNotFoundRpcError' &&
      name !== 'MethodNotSupportedRpcError'
    )
      throw error
  }
}

/** Resolves only the policy ID, preserving the owner's unsigned authorization fields. */
export async function resolvePolicyId(
  client: Client,
  parameters: {
    account: `0x${string}`
    authorization: KeyAuthorization.Unsigned
  },
): Promise<bigint> {
  const authorization = KeyAuthorization.toRpcUnsigned(parameters.authorization)
  const result = await client.request<RpcSchema[1]>({
    method: 'eth_fillKeyAuthorization',
    params: [
      {
        account: parameters.account,
        keyAuthorization: { ...authorization, fundingPolicy: true },
      },
    ],
  })
  if (
    !result?.keyAuthorization ||
    result.keyAuthorization.signature !== undefined
  )
    throw new RpcResponse.InvalidParamsError({
      message:
        '`eth_fillKeyAuthorization` must return an unsigned `keyAuthorization`.',
    })
  const policyId = result.keyAuthorization.fundingPolicy
  if (
    typeof policyId !== 'string' ||
    !Hex.validate(policyId) ||
    policyId === '0x' ||
    BigInt(policyId) <= 0n ||
    BigInt(policyId) > 0xffffffffffffffffn
  )
    throw new RpcResponse.InvalidParamsError({
      message:
        '`eth_fillKeyAuthorization` must resolve `fundingPolicy` to a nonzero uint64 policy ID.',
    })
  const filled = (() => {
    try {
      return KeyAuthorization.fromRpcUnsigned(result.keyAuthorization)
    } catch {
      throw new RpcResponse.InvalidParamsError({
        message:
          '`eth_fillKeyAuthorization` returned invalid authorization fields.',
      })
    }
  })()
  const normalized = KeyAuthorization.toRpcUnsigned(filled)
  for (const field of new Set([
    ...Object.keys(authorization),
    ...Object.keys(normalized),
  ])) {
    if (field === 'fundingPolicy') continue
    const key = field as keyof typeof authorization
    if (JSON.stringify(authorization[key]) !== JSON.stringify(normalized[key]))
      throw new RpcResponse.InvalidParamsError({
        message: `\`eth_fillKeyAuthorization\` changed \`keyAuthorization.${field}\`.`,
      })
  }
  return BigInt(policyId)
}
