import type { Abi } from 'abitype'

import { getCode } from '../../actions/public/getCode.js'
import type { Prettify } from '../../types/utils.js'
import { getAction } from '../../utils/getAction.js'
import { serializeErc6492Signature } from '../../utils/signature/serializeErc6492Signature.js'
import type { EntryPointVersion } from '../types/entryPointVersion.js'
import type { SmartAccount, SmartAccountImplementation } from './types.js'

export type ToSmartAccountParameters<
  entryPointAbi extends Abi | readonly unknown[] = Abi,
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
  extend extends object = object,
> = SmartAccountImplementation<entryPointAbi, entryPointVersion, extend>

export type ToSmartAccountReturnType<
  entryPointAbi extends Abi | readonly unknown[] = Abi,
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
  extend extends object = object,
> = Prettify<SmartAccount<entryPointAbi, entryPointVersion, extend>>

/**
 * @description Creates a Smart Account with a provided account implementation.
 *
 * @param parameters - {@link ToSmartAccountParameters}
 * @returns A Smart Account. {@link ToSmartAccountReturnType}
 */
export async function toSmartAccount<
  entryPointAbi extends Abi | readonly unknown[],
  entryPointVersion extends EntryPointVersion,
  extend extends object,
>(
  parameters: ToSmartAccountParameters<
    entryPointAbi,
    entryPointVersion,
    extend
  >,
): Promise<ToSmartAccountReturnType<entryPointAbi, entryPointVersion, extend>> {
  const { extend, ...rest } = parameters

  let deployed = false

  const address = await parameters.getAddress()

  return {
    ...extend,
    ...rest,
    address,
    async getFactoryArgs() {
      if ('isDeployed' in this && (await this.isDeployed()))
        return { factory: undefined, factoryData: undefined }
      return parameters.getFactoryArgs()
    },
    async isDeployed() {
      if (deployed) return true
      const code = await getAction(
        parameters.client,
        getCode,
        'getCode',
      )({
        address,
      })
      deployed = Boolean(code)
      return deployed
    },
    async signMessage(parameters_) {
      const [{ factory, factoryData }, signature] = await Promise.all([
        this.getFactoryArgs(),
        parameters.signMessage(parameters_),
      ])
      if (factory && factoryData)
        return serializeErc6492Signature({
          address: factory,
          data: factoryData,
          signature,
        })
      return signature
    },
    async signTypedData(parameters_) {
      const [{ factory, factoryData }, signature] = await Promise.all([
        this.getFactoryArgs(),
        parameters.signTypedData(parameters_),
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
  } as ToSmartAccountReturnType<entryPointAbi, entryPointVersion, extend>
}
