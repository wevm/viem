import type { Address } from 'abitype'
import {
  type FundingPolicy,
  type FundingRequirement,
  FundingSource,
  type KeyAuthorization,
} from 'ox/tempo'
import type { Tokens } from '../tokens/defineToken.js'
import { tokens } from '../tokens/sets.js'
import type { Hex } from '../types/misc.js'
import type { UnionOmit } from '../types/utils.js'
import * as Addresses from './Addresses.js'
import type * as internal from './internal/funding.js'
import type * as Relay from './Relay.js'

/** An unsigned funding requirement whose omitted fields are resolved before signing. */
export type Requirement = internal.FundingRequirementIntent

/** Funding intent at the unsigned RPC boundary. */
export type RequirementRpc = FundingRequirement.RequestRpc

/** Funding relay RPC methods. */
export type RpcSchema = [
  {
    Method: 'funding_registerPolicyRules'
    Parameters: [{ chainId: Hex; rules: Hex }]
    ReturnType: { rulesHash: Hex }
  },
  {
    Method: 'eth_fillKeyAuthorization'
    Parameters: [
      {
        account: Address
        keyAuthorization: UnionOmit<
          KeyAuthorization.UnsignedRpc,
          'fundingPolicy'
        > & {
          fundingPolicy?: true | FundingPolicy.Rpc | undefined
        }
      },
    ]
    ReturnType: { keyAuthorization: KeyAuthorization.UnsignedRpc }
  },
]

/** Selects known parity inputs without assuming that they have balances or liquidity. @internal */
export function defaultRoute({
  chainId,
  token,
}: {
  chainId: number
  token: Address
}): Relay.funding.Route | undefined {
  // Localnet deploys the four standard test tokens.
  const tokenChainId = chainId === 1337 ? 42431 : chainId
  if (tokenChainId !== 4217 && tokenChainId !== 42431) return undefined

  const known: Tokens =
    chainId === 1337
      ? tokens.tempo.filter((entry) => {
          const address = (entry.addresses as Record<number, Address>)[42431]
          return [
            Addresses.pathUsd,
            Addresses.alphaUsd,
            Addresses.betaUsd,
            Addresses.thetaUsd,
          ].some((token) => token === address)
        })
      : tokens.tempo
  const output = known.find(
    (entry) =>
      entry.addresses[tokenChainId]?.toLowerCase() === token.toLowerCase(),
  )
  if (!output?.currency) return undefined

  return {
    sources: known.flatMap((entry) => {
      const tokenIn = entry.addresses[tokenChainId]
      if (
        !tokenIn ||
        entry.currency !== output.currency ||
        tokenIn.toLowerCase() === token.toLowerCase()
      )
        return []
      return [FundingSource.dex({ tokenIn })]
    }),
  }
}
