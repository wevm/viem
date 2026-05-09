import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import {
  type GetPaymasterDataParameters,
  type GetPaymasterDataReturnType,
  getPaymasterData,
} from '../../actions/paymaster/getPaymasterData.js'
import {
  type GetPaymasterStubDataParameters,
  type GetPaymasterStubDataReturnType,
  getPaymasterStubData,
} from '../../actions/paymaster/getPaymasterStubData.js'

export type PaymasterActions = {
  /**
   * Retrieves paymaster-related User Operation properties to be used for sending the User Operation.
   *
   * - Docs: https://viem.sh/account-abstraction/actions/paymaster/getPaymasterData
   *
   * @param client - Client to use
   * @param parameters - {@link GetPaymasterDataParameters}
   * @returns Paymaster-related User Operation properties. {@link GetPaymasterDataReturnType}
   *
   * @example
   * import { http } from 'viem'
   * import { createPaymasterClient } from 'viem/account-abstraction'
   *
   * const paymasterClient = createPaymasterClient({
   *   transport: http('https://...'),
   * })
   *
   * const userOperation = { ... }
   *
   * const values = await paymasterClient.getPaymasterData({
   *   chainId: 1,
   *   entryPointAddress: '0x...',
   *   ...userOperation,
   * })
   */
  getPaymasterData: (
    parameters: GetPaymasterDataParameters,
  ) => Promise<GetPaymasterDataReturnType>
  /**
   * Retrieves paymaster-related User Operation properties to be used for gas estimation.
   *
   * - Docs: https://viem.sh/account-abstraction/actions/paymaster/getPaymasterStubData
   *
   * @param client - Client to use
   * @param parameters - {@link GetPaymasterStubDataParameters}
   * @returns Paymaster-related User Operation properties. {@link GetPaymasterStubDataReturnType}
   *
   * @example
   * import { http } from 'viem'
   * import { createPaymasterClient } from 'viem/account-abstraction'
   *
   * const paymasterClient = createPaymasterClient({
   *   transport: http('https://...'),
   * })
   *
   * const userOperation = { ... }
   *
   * const values = await paymasterClient.getPaymasterStubData({
   *   chainId: 1,
   *   entryPointAddress: '0x...',
   *   ...userOperation,
   * })
   */
  getPaymasterStubData: (
    parameters: GetPaymasterStubDataParameters,
  ) => Promise<GetPaymasterStubDataReturnType>
}

export function paymasterActions<transport extends Transport = Transport>(
  client: Client<transport>,
): PaymasterActions {
  return {
    getPaymasterData: (parameters) => getPaymasterData(client, parameters),
    getPaymasterStubData: (parameters) =>
      getPaymasterStubData(client, parameters),
  }
}
