import type * as Errors from 'ox/Errors'
import * as Hash from 'ox/Hash'
import * as Hex from 'ox/Hex'
import type * as TokenId from 'ox/tempo/TokenId'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { ReadParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  resolveCallParameters,
  resolveToken,
} from '../../internal/utils.js'

/**
 * Gets the reserves for a liquidity pool.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const pool = await Actions.amm.getPool(client, {
 *   userToken: '0x20c0000000000000000000000000000000000001',
 *   validatorToken: '0x20c0000000000000000000000000000000000002',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The pool reserves.
 */
export async function getPool<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getPool.Options,
): Promise<getPool.ReturnType> {
  const { userToken, validatorToken, ...rest } = options
  const [poolCall, totalSupplyCall] = getPool.calls(client, {
    userToken,
    validatorToken,
  })
  const [pool, totalSupply] = await Promise.all([
    read(client, { ...rest, ...poolCall }),
    read(client, { ...rest, ...totalSupplyCall }),
  ])
  return {
    reserveUserToken: (pool as { reserveUserToken: bigint }).reserveUserToken,
    reserveValidatorToken: (pool as { reserveValidatorToken: bigint })
      .reserveValidatorToken,
    totalSupply: totalSupply as bigint,
  }
}

export namespace getPool {
  export type Args = {
    /** Address or ID of the user token. */
    userToken: TokenId.TokenIdOrAddress
    /** Address or ID of the validator token. */
    validatorToken: TokenId.TokenIdOrAddress
  }
  export type Options = Omit<ReadParameters, 'account'> & Args
  export type ReturnType = {
    /** Reserve of user token. */
    reserveUserToken: bigint
    /** Reserve of validator token. */
    reserveValidatorToken: bigint
    /** Total supply of LP tokens. */
    totalSupply: bigint
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /**
   * Defines calls to the `getPool` and `totalSupply` functions.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The calls.
   */
  export function calls<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const userTokenAddress = resolveToken(client, {
      token: args.userToken,
    }).address
    const validatorTokenAddress = resolveToken(client, {
      token: args.validatorToken,
    }).address
    // Fee-AMM pool ids are directional: keccak256(pad32(userToken) || pad32(validatorToken)).
    const poolId = Hash.keccak256(
      Hex.concat(
        Hex.padLeft(userTokenAddress, 32),
        Hex.padLeft(validatorTokenAddress, 32),
      ),
    )
    return [
      defineCall({
        abi: Abis.feeAmm,
        address: Addresses.feeManager,
        args: [userTokenAddress, validatorTokenAddress],
        functionName: 'getPool',
      }),
      defineCall({
        abi: Abis.feeAmm,
        address: Addresses.feeManager,
        args: [poolId],
        functionName: 'totalSupply',
      }),
    ] as const
  }
}
