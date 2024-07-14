import type { Address } from 'abitype'

import { getCode } from '../actions/public/getCode.js'
import type { Client } from '../clients/createClient.js'
import type { Prettify } from '../types/utils.js'
import { getAction } from '../utils/getAction.js'
import { serializeErc6492Signature } from '../utils/signature/serializeErc6492Signature.js'
import type {
  SmartAccountImplementation,
  SmartAccountImplementationFn,
} from './implementations/defineImplementation.js'
import type { SmartAccount } from './types.js'

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
    async signMessage(parameters) {
      const [{ factory, factoryData }, signature] = await Promise.all([
        this.getFactoryArgs(),
        implementation.signMessage(parameters),
      ])
      if (factory && factoryData)
        return serializeErc6492Signature({
          address: factory,
          data: factoryData,
          signature,
        })
      return signature
    },
    async signTypedData(parameters) {
      const [{ factory, factoryData }, signature] = await Promise.all([
        this.getFactoryArgs(),
        implementation.signTypedData(parameters),
      ])
      if (factory && factoryData)
        return serializeErc6492Signature({
          address: factory,
          data: factoryData,
          signature,
        })
      return signature
    },
    type: 'smart',
  } as ToSmartAccountReturnType<implementation>
}
