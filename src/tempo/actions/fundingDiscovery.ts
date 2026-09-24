import type { Address } from 'abitype'
import { readContract } from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import { getAbiItem } from '../../utils/abi/getAbiItem.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'

/**
 * Finds available funding sources using supplied rules and an optional funding policy.
 * Discovery reserves no funds and does not guarantee execution-time availability.
 *
 * @example
 * ```ts
 * import { Actions, Addresses, FundingPolicy, FundingSource } from 'viem/tempo'
 *
 * const discovery = await Actions.fundingDiscovery.discover(client, {
 *   account: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb',
 *   amount: 50_000_000n,
 *   rules: FundingPolicy.encode({
 *     maxSlippageBps: 100,
 *     sources: {
 *       [Addresses.pathUsd]: [{
 *         target: Addresses.dexFundingSource,
 *         data: FundingSource.encodeData({ tokenIn: Addresses.alphaUsd }),
 *       }],
 *     },
 *   }),
 *   token: Addresses.pathUsd,
 * })
 * await Actions.token.transferSync(client, {
 *   amount: 50_000_000n,
 *   requireFunds: [discovery],
 *   to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
 *   token: Addresses.pathUsd,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Account, output token, amount, encoded rules, and optional policy ID.
 * @returns A funding requirement with ordered sources and their currently available amounts.
 */
export async function discover<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: discover.Parameters,
): Promise<discover.ReturnValue> {
  const { account, amount, policyId, rules, token, ...rest } = parameters
  const { sources, ...discovery } =
    policyId === undefined
      ? await readContract(client, {
          ...rest,
          address: Addresses.fundingDiscovery,
          abi: Abis.fundingDiscovery,
          functionName: 'discover',
          args: [account, token, amount, rules],
        })
      : await readContract(client, {
          ...rest,
          address: Addresses.fundingDiscovery,
          abi: Abis.fundingDiscovery,
          functionName: 'discover',
          args: [policyId, account, token, amount, rules],
        })
  return {
    ...discovery,
    sources: sources.map(({ target, ...source }) => ({
      ...source,
      to: target,
    })),
  }
}

export namespace discover {
  export type Args = {
    /** Account whose available inputs are inspected. */
    account: Address
    /** Requested output balance in token base units. */
    amount: bigint
    /** Optional policy ID whose commitment must match the supplied rules. */
    policyId?: bigint | undefined
    /** Canonical ABI-encoded rules used to select sources and slippage. */
    rules: Hex
    /** Required output token. */
    token: Address
  }
  export type Parameters = ReadParameters & Args
  export type ReturnValue = {
    /** Requested output token. */
    token: Address
    /** Target balance in token base units. */
    amount: bigint
    /** Maximum aggregate slippage from the supplied rules. */
    slippageBps: number
    /** Ordered sources usable directly in an owner-authorized funding requirement. */
    sources: readonly {
      /** Funding source address. */
      to: Address
      /** Source-specific request data. */
      data: Hex
      /** Advisory available output in token base units. */
      availableAmount: bigint
    }[]
  }
  export type ErrorType = BaseErrorType

  /**
   * Defines the `discover` call, checking a stored policy only when its ID is supplied.
   *
   * @param args - Account, token, amount, encoded rules, and optional policy ID.
   * @returns The contract call.
   */
  export function call(args: Args) {
    if (args.policyId === undefined) {
      const parameters = [
        args.account,
        args.token,
        args.amount,
        args.rules,
      ] as const
      return defineCall({
        address: Addresses.fundingDiscovery,
        abi: [
          getAbiItem({
            abi: Abis.fundingDiscovery,
            name: 'discover',
            args: parameters,
          }),
        ],
        functionName: 'discover',
        args: parameters,
      })
    }
    const parameters = [
      args.policyId,
      args.account,
      args.token,
      args.amount,
      args.rules,
    ] as const
    return defineCall({
      address: Addresses.fundingDiscovery,
      abi: [
        getAbiItem({
          abi: Abis.fundingDiscovery,
          name: 'discover',
          args: parameters,
        }),
      ],
      functionName: 'discover',
      args: parameters,
    })
  }
}
