import { AbiError, AbiParameters, Address, Hex } from 'ox'
import type { Errors } from 'ox'

import type * as Client from '../../Client.js'
import { getAbortError, isAbortError } from '../../internal/errors.js'
import * as CcipRead from '../../../utils/CcipRead.js'
import { call } from '../call.js'
import {
  localBatchGatewayRequest,
  localBatchGatewayUrl,
} from '../ens/internal/batchGateway.js'

type RequestOptions = Parameters<Client.Client['request']>[1]

const offchainLookupAbiError = /*#__PURE__*/ AbiError.from(
  'error OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData)',
)

const responseParameters = /*#__PURE__*/ AbiParameters.from('bytes, bytes')

/**
 * Resolves an [ERC-3668 `OffchainLookup`](https://eips.ethereum.org/EIPS/eip-3668)
 * revert: fetches the offchain result from the reverting contract's gateways
 * and re-executes the call through its callback function.
 */
export async function offchainLookup(
  client: Client.Client,
  options: offchainLookup.Options,
): Promise<Hex.Hex | undefined> {
  const { blockNumber, blockTag, data, request, requestOptions, to } = options

  const [sender, urls, callData, callbackSelector, extraData] = AbiError.decode(
    offchainLookupAbiError,
    data,
  ) as [Address.Address, readonly string[], Hex.Hex, Hex.Hex, Hex.Hex]

  try {
    if (!Address.isEqual(to, sender))
      throw new CcipRead.SenderMismatchError({ sender, to })

    const result = urls.includes(localBatchGatewayUrl)
      ? await localBatchGatewayRequest({
          data: callData,
          request: (parameters) => request({ ...parameters, requestOptions }),
        })
      : await request({ data: callData, requestOptions, sender, urls })

    const { data: response } = await call(client, {
      blockNumber,
      blockTag,
      data: Hex.concat(
        callbackSelector,
        AbiParameters.encode(responseParameters, [result, extraData]),
      ),
      requestOptions,
      to,
    } as call.Options)

    return response
  } catch (err) {
    if (requestOptions?.signal?.aborted)
      throw getAbortError(requestOptions.signal)
    if (isAbortError(err)) throw err

    throw new CcipRead.LookupError({
      callbackSelector,
      cause: err as Error,
      data,
      extraData,
      sender,
      urls,
    })
  }
}

export declare namespace offchainLookup {
  type Options = {
    /** The block number the original call executed against. */
    blockNumber?: bigint | undefined
    /** The block tag the original call executed against. */
    blockTag?: string | undefined
    /** The `OffchainLookup` revert data. */
    data: Hex.Hex
    /** Makes the offchain gateway request. */
    request: CcipRead.Request
    /** Per-request transport options. */
    requestOptions?: RequestOptions | undefined
    /** The contract that reverted with `OffchainLookup`. */
    to: Address.Address
  }

  type ErrorType =
    | AbiError.decode.ErrorType
    | CcipRead.LookupError
    | Errors.GlobalErrorType
}
