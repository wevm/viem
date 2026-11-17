import type { Address } from 'ox'
import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import * as ContractError from '../../../core/ContractError.js'
import { BaseError } from '../../../core/Errors.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { ReadParameters } from '../../internal/types.js'
import { defineCall, read } from '../../internal/utils.js'

const zeroHash =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

/**
 * Gets the current configuration commitment for a configurable account.
 *
 * A chain without the configurable account precompile holds no commitments,
 * so the commitment of every account on it is zero.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const commitment = await Actions.accounts.getConfigCommitment(client, {
 *   account: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The current configuration commitment, or zero when no config has
 * been committed or the chain has no configurable account precompile.
 */
export async function getConfigCommitment<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: getConfigCommitment.Options,
): Promise<getConfigCommitment.ReturnType> {
  const { account, ...rest } = parameters
  try {
    return await read(client, {
      ...rest,
      ...getConfigCommitment.call({ account }),
    })
  } catch (error) {
    // A chain without the precompile answers no data, and holds no commitments.
    if (
      error instanceof BaseError &&
      error.walk(
        (cause) => cause instanceof ContractError.ContractFunctionZeroDataError,
      )
    )
      return zeroHash
    throw error
  }
}

export namespace getConfigCommitment {
  export type Options = ReadParameters & Args

  export type Args = {
    /** Initialized configurable account address. */
    account: Address.Address
  }

  export type ReturnType = read.ReturnType<
    typeof Abis.configurableAccount,
    'getConfigCommitment',
    never
  >

  /**
   * Defines a call to the `getConfigCommitment` function.
   *
   * Can be passed to [`multicall`](https://viem.sh/docs/contract/multicall).
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    return defineCall({
      address: Addresses.configurableAccount,
      abi: Abis.configurableAccount,
      args: [args.account],
      functionName: 'getConfigCommitment',
    })
  }
}
