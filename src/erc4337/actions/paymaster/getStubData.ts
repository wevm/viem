import { Hex, type Errors } from 'ox'

import type * as Client from '../../../core/Client.js'
import type * as Transport from '../../../core/Transport.js'
import type * as EntryPoint from '../../EntryPoint.js'
import * as internal from './internal.js'

/**
 * Returns Paymaster fields for User Operation gas estimation.
 *
 * @example
 * ```ts
 * import { Actions, PaymasterClient, http } from 'viem/erc4337'
 *
 * const client = PaymasterClient.create({ transport: http() })
 * const fields = await Actions.paymaster.getStubData(client, {
 *   callData: '0x',
 *   chainId: 1,
 *   entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
 *   nonce: 0n,
 *   sender: '0x0000000000000000000000000000000000000000',
 * })
 * ```
 */
export function getStubData<
  entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
>(
  client: Pick<Client.Client, 'request'>,
  options: getStubData.Options<entryPointVersion>,
): Promise<getStubData.ReturnType<entryPointVersion>>

export async function getStubData(
  client: Pick<Client.Client, 'request'>,
  options: getStubData.Options,
): Promise<getStubData.ReturnType> {
  const { chainId, context, entryPointAddress } = options
  const request = client.request as Transport.RequestFn<internal.RpcSchema>
  const response = await request({
    method: 'pm_getPaymasterStubData',
    params: [
      internal.toRpc(options),
      entryPointAddress,
      Hex.fromNumber(chainId),
      context,
    ],
  })

  // Return only paymaster fields, even when the service echoes back others.
  const { isFinal, sponsor } = response
  const extra = {
    ...(isFinal !== undefined && { isFinal }),
    ...(sponsor !== undefined && { sponsor }),
  }

  if ('paymasterAndData' in response)
    return { paymasterAndData: response.paymasterAndData, ...extra }

  const {
    paymaster,
    paymasterData,
    paymasterPostOpGasLimit,
    paymasterVerificationGasLimit,
  } = response

  return {
    paymaster,
    paymasterData,
    paymasterPostOpGasLimit: Hex.toBigInt(paymasterPostOpGasLimit),
    ...('paymasterSignature' in response &&
      response.paymasterSignature !== undefined && {
        paymasterSignature: response.paymasterSignature,
      }),
    ...(paymasterVerificationGasLimit !== undefined && {
      paymasterVerificationGasLimit: Hex.toBigInt(
        paymasterVerificationGasLimit,
      ),
    }),
    ...extra,
  }
}

export declare namespace getStubData {
  /** Options for {@link getStubData}. */
  type Options<
    entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
  > = internal.Options<entryPointVersion>

  /** Return type of {@link getStubData}. */
  type ReturnType<
    entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
  > = internal.StubPaymasterFields<entryPointVersion> & {
    /** Whether these fields can be used without a final data request. */
    isFinal?: boolean | undefined
    /** Information about the party sponsoring the User Operation. */
    sponsor?:
      | {
          /** Data URI containing the sponsor icon. */
          icon?: string | undefined
          /** Sponsor name. */
          name: string
        }
      | undefined
  }

  /** Errors thrown by {@link getStubData}. */
  type ErrorType =
    | Hex.fromNumber.ErrorType
    | Hex.toBigInt.ErrorType
    | internal.toRpc.ErrorType
    | Errors.GlobalErrorType
}
