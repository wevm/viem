import * as Hex from 'ox/Hex'
import { FundingPolicy, type FundingRequirement } from 'ox/tempo'
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
