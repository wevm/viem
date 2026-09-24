import type { Address } from 'abitype'
import type { ReadContractReturnType } from '../../actions/public/readContract.js'
import { readContract } from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'

/**
 * Finds available funding sources permitted by a funding policy.
 * Discovery reserves no funds and does not guarantee execution-time availability.
 *
 * @example
 * ```ts
 * import { Actions, Addresses, FundingPolicy, FundingSource } from 'viem/tempo'
 *
 * const discovery = await Actions.fundingDiscovery.discover(client, {
 *   account: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb',
 *   amount: 50_000_000n,
 *   policyId: 1n,
 *   policyRules: FundingPolicy.encode({
 *     maxSlippageBps: 100,
 *     sources: {
 *       [Addresses.pathUsd]: [{
 *         target: Addresses.nativeDexFundingSource,
 *         data: FundingSource.encodeData({ tokenIn: Addresses.alphaUsd }),
 *       }],
 *     },
 *   }),
 *   token: Addresses.pathUsd,
 * })
 * const sources = discovery.sources.map(({ target, data }) => ({ to: target, data }))
 * ```
 *
 * @param client - Client.
 * @param parameters - Policy, account, output token, amount, and encoded rules.
 * @returns The ordered candidates and their currently available amounts.
 */
export async function discover<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: discover.Parameters,
): Promise<discover.ReturnValue> {
  const { account, amount, policyId, policyRules, token, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...discover.call({ account, amount, policyId, policyRules, token }),
  })
}

export namespace discover {
  export type Args = {
    /** Account whose available inputs are inspected. */
    account: Address
    /** Requested output balance in token base units. */
    amount: bigint
    /** Selected funding policy ID. */
    policyId: bigint
    /** ABI-encoded rules matching the policy's current commitment. */
    policyRules: Hex
    /** Required output token. */
    token: Address
  }
  export type Parameters = ReadParameters & Args
  export type ReturnValue = ReadContractReturnType<
    typeof Abis.fundingDiscovery,
    'discover',
    never
  >
  export type ErrorType = BaseErrorType

  /**
   * Defines the `discover` call with complete ABI-encoded policy rules.
   *
   * @param args - Policy, account, token, amount, and encoded rules.
   * @returns The contract call.
   */
  export function call(args: Args) {
    return defineCall({
      address: Addresses.fundingDiscovery,
      abi: Abis.fundingDiscovery,
      functionName: 'discover',
      args: [
        args.policyId,
        args.account,
        args.token,
        args.amount,
        args.policyRules,
      ],
    })
  }
}
