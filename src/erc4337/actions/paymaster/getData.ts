import { Hex, type Errors } from 'ox'

import type * as Client from '../../../core/Client.js'
import type * as Transport from '../../../core/Transport.js'
import type * as EntryPoint from '../../EntryPoint.js'
import * as internal from './internal.js'

/**
 * Returns final Paymaster fields for sending a User Operation.
 *
 * @example
 * ```ts
 * import { Actions, PaymasterClient, http } from 'viem/erc4337'
 *
 * const client = PaymasterClient.create({ transport: http() })
 * const fields = await Actions.paymaster.getData(client, {
 *   callData: '0x',
 *   chainId: 1,
 *   entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
 *   nonce: 0n,
 *   sender: '0x0000000000000000000000000000000000000000',
 * })
 * ```
 */
export function getData<
  entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
>(
  client: Pick<Client.Client, 'request'>,
  options: getData.Options<entryPointVersion>,
): Promise<getData.ReturnType<entryPointVersion>>

export async function getData(
  client: Pick<Client.Client, 'request'>,
  options: getData.Options,
): Promise<getData.ReturnType> {
  const { chainId, context, entryPointAddress } = options
  const request = client.request as Transport.RequestFn<internal.RpcSchema>
  const response = await request({
    method: 'pm_getPaymasterData',
    params: [
      internal.toRpc(options),
      entryPointAddress,
      Hex.fromNumber(chainId),
      context,
    ],
  })

  if ('paymasterAndData' in response) return response

  const { paymasterPostOpGasLimit, paymasterVerificationGasLimit, ...result } =
    response

  return {
    ...result,
    ...(paymasterPostOpGasLimit !== undefined && {
      paymasterPostOpGasLimit: Hex.toBigInt(paymasterPostOpGasLimit),
    }),
    ...(paymasterVerificationGasLimit !== undefined && {
      paymasterVerificationGasLimit: Hex.toBigInt(
        paymasterVerificationGasLimit,
      ),
    }),
  }
}

export declare namespace getData {
  /** Options for {@link getData}. */
  type Options<
    entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
  > = internal.Options<entryPointVersion>

  /** Return type of {@link getData}. */
  type ReturnType<
    entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
  > = internal.PaymasterFields<entryPointVersion>

  /** Errors thrown by {@link getData}. */
  type ErrorType =
    | Hex.fromNumber.ErrorType
    | Hex.toBigInt.ErrorType
    | internal.toRpc.ErrorType
    | Errors.GlobalErrorType
}
