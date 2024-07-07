import type { Address } from 'abitype'

import { getCode } from '../actions/public/getCode.js'
import type { Client } from '../clients/createClient.js'
import type {
  SmartAccount,
  SmartAccountImplementation,
  SmartAccountImplementationFn,
} from './types.js'

export type ToSmartAccountParameters<
  implementation extends
    SmartAccountImplementation = SmartAccountImplementation,
> = {
  address?: Address | undefined
  client: Client
  implementation: SmartAccountImplementationFn<implementation>
}

export type ToSmartAccountReturnType<
  implementation extends
    SmartAccountImplementation = SmartAccountImplementation,
> = SmartAccount<implementation>

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
      const code = await getCode(client, {
        address: await implementation.getAddress(),
      })
      deployed = Boolean(code)
      return deployed
    },
    type: 'smart',
  } as ToSmartAccountReturnType<implementation>
}
