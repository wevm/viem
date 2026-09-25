import type { Hex } from 'ox'
import { FundingPolicy, type FundingRequirement } from 'ox/tempo'

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
