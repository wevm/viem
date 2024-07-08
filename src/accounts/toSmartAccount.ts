import type { Address } from 'abitype'

import { getCode } from '../actions/public/getCode.js'
import type { Client } from '../clients/createClient.js'
import type { Prettify } from '../types/utils.js'
import { getAction } from '../utils/getAction.js'
import type {
  SmartAccount,
  SmartAccountImplementation,
  SmartAccountImplementationFn,
} from './types.js'

export type ToSmartAccountParameters<
  implementation extends
    SmartAccountImplementation = SmartAccountImplementation,
> = {
  /** Address of the Smart Account. */
  address?: Address | undefined
  /** Client used to retrieve Smart Account data, and perform signing (if owner is a JSON-RPC Account). */
  client: Client
  /** Implementation of the Smart Account. */
  implementation: SmartAccountImplementationFn<implementation>
}

export type ToSmartAccountReturnType<
  implementation extends
    SmartAccountImplementation = SmartAccountImplementation,
> = Prettify<SmartAccount<implementation>>

/**
 * @description Creates a Smart Account with a provided account implementation.
 *
 * @param parameters - {@link ToSmartAccountParameters}
 * @returns A Smart Account. {@link ToSmartAccountReturnType}
 *
 * @example
 * import { toSmartAccount, solady } from 'viem/accounts'
 *
 * const account = toSmartAccount({
 *   implementation: solady({
 *     factoryAddress: '0x...',
 *     owner: '0x...',
 *   })
 * })
 */
export async function toSmartAccount<
  implementation extends SmartAccountImplementation,
>(
  parameters: ToSmartAccountParameters<implementation>,
): Promise<ToSmartAccountReturnType<implementation>> {
  const { client } = parameters
  const implementation = parameters.implementation({
    address: parameters.address,
    client,
  })

  let deployed = false

  const address = await implementation.getAddress()

  return {
    ...implementation,
    address,
    async getFactoryArgs() {
      if ('isDeployed' in this && (await this.isDeployed()))
        return { factory: undefined, factoryData: undefined }
      return implementation.getFactoryArgs()
    },
    async isDeployed() {
      if (deployed) return true
      const code = await getAction(
        client,
        getCode,
        'getCode',
      )({
        address: await implementation.getAddress(),
      })
      deployed = Boolean(code)
      return deployed
    },
    type: 'smart',
  } as ToSmartAccountReturnType<implementation>
}
