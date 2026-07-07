import type * as Address from 'ox/Address'
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

/** Gets the LP token balance for an account in a specific pool. */
export async function getLiquidityBalance<
  chain extends Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getLiquidityBalance.Options,
): Promise<getLiquidityBalance.ReturnType> {
  return read(client, {
    ...options,
    ...getLiquidityBalance.call(client, options),
  })
}

export namespace getLiquidityBalance {
  export type Args = {
    /** Address to check balance for. */
    address: Address.Address
  } & (
    | { /** Pool ID. */ poolId: Hex.Hex }
    | {
        /** User token. */
        userToken: TokenId.TokenIdOrAddress
        /** Validator token. */
        validatorToken: TokenId.TokenIdOrAddress
      }
  )
  export type Options = Omit<ReadParameters, 'account'> & Args
  export type ReturnType = bigint
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** Defines a call to the `liquidityBalances` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const { address } = args
    const poolId = (() => {
      if ('poolId' in args) return args.poolId
      const userTokenAddress = resolveToken(client, {
        token: args.userToken,
      }).address
      const validatorTokenAddress = resolveToken(client, {
        token: args.validatorToken,
      }).address
      // Fee-AMM pool ids are directional: keccak256(pad32(userToken) || pad32(validatorToken)).
      return Hash.keccak256(
        Hex.concat(
          Hex.padLeft(userTokenAddress, 32),
          Hex.padLeft(validatorTokenAddress, 32),
        ),
      )
    })()
    return defineCall({
      abi: Abis.feeAmm,
      address: Addresses.feeManager,
      args: [poolId, address],
      functionName: 'liquidityBalances',
    })
  }
}
