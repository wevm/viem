import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as TokenId from 'ox/tempo/TokenId'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import {
  FeeTokenNotTip20Error,
  FeeTokenNotUsdError,
  FeeTokenPausedError,
  InvalidFeeTokenError,
} from '../../errors.js'
import type { ReadParameters, TokenParameter } from '../../internal/types.js'
import { getMetadata } from '../token/getMetadata.js'

const tip20AddressPrefix = '0x20c0'

/**
 * Validates that a token can be used as a Tempo fee token.
 *
 * Fee tokens must be unpaused USD-denominated TIP-20 tokens.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const { address, id, metadata } = await Actions.fee.validateToken(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The fee token address, id, and metadata.
 */
export async function validateToken<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: validateToken.Options,
): Promise<validateToken.ReturnType> {
  const { token, ...rest } = options
  const address = (() => {
    try {
      return TokenId.toAddress(token)
    } catch (cause) {
      throw new InvalidFeeTokenError({
        cause: cause as Error,
        token: String(token),
      })
    }
  })()

  if (!address.toLowerCase().startsWith(tip20AddressPrefix))
    throw new FeeTokenNotTip20Error({ token: address })

  const isPathUsd = address.toLowerCase() === Addresses.pathUsd.toLowerCase()
  if (!isPathUsd) {
    const isTip20 = await read(client, {
      ...rest,
      abi: Abis.tip20Factory,
      address: Addresses.tip20Factory,
      args: [address],
      functionName: 'isTIP20',
    }).catch((cause) => {
      throw new InvalidFeeTokenError({ cause, token: address })
    })
    if (!isTip20) throw new FeeTokenNotTip20Error({ token: address })
  }

  const metadata = await getMetadata(client, {
    ...rest,
    token: address,
  }).catch((cause) => {
    throw new InvalidFeeTokenError({ cause, token: address })
  })

  if (metadata.currency !== 'USD')
    throw new FeeTokenNotUsdError({
      currency: metadata.currency,
      token: address,
    })
  if (metadata.paused === true)
    throw new FeeTokenPausedError({ token: address })

  return {
    address,
    id: TokenId.fromAddress(address),
    metadata,
  }
}

export namespace validateToken {
  export type Options = Omit<ReadParameters, 'account'> & TokenParameter
  export type ReturnType = {
    /** Fee token contract address. */
    address: Address.Address
    /** Fee token id. */
    id: bigint
    /** Fee token metadata. */
    metadata: getMetadata.ReturnType
  }
  export type ErrorType =
    | FeeTokenNotTip20Error
    | FeeTokenNotUsdError
    | FeeTokenPausedError
    | InvalidFeeTokenError
    | Errors.GlobalErrorType
}
