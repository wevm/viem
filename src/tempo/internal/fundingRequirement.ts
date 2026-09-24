import type { Hex } from 'ox'
import { FundingPolicy, type FundingRequirement } from 'ox/tempo'

export type FundingRequirementInput<
  quantity = bigint,
  index = number,
> = FundingRequirement.FundingRequirement<quantity, index> & {
  /** Complete policy rules, decoded or ABI-encoded. */
  rules?: FundingPolicy.Rules | Hex.Hex | undefined
}

export function normalizeFundingRequirements<quantity, index>(
  requirements: readonly FundingRequirementInput<quantity, index>[] | undefined,
  ownerAuthorized = false,
):
  | readonly FundingRequirement.FundingRequirement<quantity, index>[]
  | undefined {
  return requirements?.map(({ rules, ...requirement }) => {
    if (rules === undefined) return requirement
    if (requirement.policyRules !== undefined)
      throw new Error('Specify either `rules` or `policyRules`, not both.')
    if (ownerAuthorized) return requirement
    return {
      ...requirement,
      policyRules:
        typeof rules === 'string' ? rules : FundingPolicy.encode(rules),
    }
  })
}
