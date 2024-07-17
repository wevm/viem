import type { Abi } from 'abitype'

import { getCode } from '../../actions/public/getCode.js'
import type { Prettify } from '../../types/utils.js'
import { getAction } from '../../utils/getAction.js'
import { serializeErc6492Signature } from '../../utils/signature/serializeErc6492Signature.js'
import type { EntryPointVersion } from '../types/entryPointVersion.js'
import type { SmartAccount, SmartAccountImplementation } from './types.js'

export type ToSmartAccountParameters<
  abi extends Abi | readonly unknown[] = Abi,
  factoryAbi extends Abi | readonly unknown[] = Abi,
  entryPointAbi extends Abi | readonly unknown[] = Abi,
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = SmartAccountImplementation<
  abi,
  factoryAbi,
  entryPointAbi,
  entryPointVersion
>

export type ToSmartAccountReturnType<
  abi extends Abi | readonly unknown[] = Abi,
  factoryAbi extends Abi | readonly unknown[] = Abi,
  entryPointAbi extends Abi | readonly unknown[] = Abi,
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = Prettify<SmartAccount<abi, factoryAbi, entryPointAbi, entryPointVersion>>

/**
 * @description Creates a Smart Account with a provided account implementation.
 *
 * @param parameters - {@link ToSmartAccountParameters}
 * @returns A Smart Account. {@link ToSmartAccountReturnType}
 */
export async function toSmartAccount<
  abi extends Abi | readonly unknown[],
  factoryAbi extends Abi | readonly unknown[],
  entryPointAbi extends Abi | readonly unknown[],
  entryPointVersion extends EntryPointVersion,
>(
  parameters: ToSmartAccountParameters<
    abi,
    factoryAbi,
    entryPointAbi,
    entryPointVersion
  >,
): Promise<
  ToSmartAccountReturnType<abi, factoryAbi, entryPointAbi, entryPointVersion>
> {
  const { client } = parameters

  let deployed = false

  const address = await parameters.getAddress()

  return {
    ...parameters,
    address,
    async getFactoryArgs() {
      if ('isDeployed' in this && (await this.isDeployed()))
        return { factory: undefined, factoryData: undefined }
      return parameters.getFactoryArgs()
    },
    async isDeployed() {
      if (deployed) return true
      const code = await getAction(
        client,
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
  } as ToSmartAccountReturnType<
    abi,
    factoryAbi,
    entryPointAbi,
    entryPointVersion
  >
}
