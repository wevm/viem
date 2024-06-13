import type { Address } from 'abitype'

import { getBytecode } from '../../../actions/public/getBytecode.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type {
  SmartAccount,
  SmartAccountImplementation,
  SmartAccountImplementationFn,
} from './types.js'

export type ToSmartAccountParameters<
  address extends Address | undefined = Address | undefined,
  client extends Client | undefined = Client | undefined,
  implementation extends
    SmartAccountImplementation = SmartAccountImplementation,
> = {
  address?: address | Address | undefined
  client?: client | undefined
  implementation: SmartAccountImplementationFn<implementation>
}

export type ToSmartAccountReturnType<
  address extends Address | undefined = Address | undefined,
  client extends Client | undefined = undefined,
  implementation extends
    SmartAccountImplementation = SmartAccountImplementation,
> = SmartAccount<address, client extends Client ? true : false, implementation>

/**
 * @description Creates a Smart Account with a provided account implementation.
 *
 * @param parameters - {@link ToSmartAccountParameters}
 * @returns A Smart Account. {@link ToSmartAccountReturnType}
 *
 * @example
 * import { toSmartAccount, solady } from 'viem/experimental'
 *
 * const account = toSmartAccount({
 *   implementation: solady({
 *     factoryAddress: '0x...',
 *     owner: '0x...',
 *   })
 * })
 */
export function toSmartAccount<
  address extends Address | undefined,
  implementation extends SmartAccountImplementation,
  client extends Client<Transport> | undefined = undefined,
>(
  parameters: ToSmartAccountParameters<address, client, implementation>,
): ToSmartAccountReturnType<address, client, implementation> {
  let address: Address | undefined = parameters.address
  let client: Client<Transport> | undefined = parameters.client
  let implementation = client
    ? parameters.implementation({ address, client })
    : undefined

  let deployed = false

  function wrap(value: SmartAccount<address, true, implementation>) {
    if (!implementation) return value
    return Object.assign(value, {
      async getFactoryArgs() {
        if (await this.isDeployed())
          return { factory: undefined, factoryData: undefined }
        return implementation!.getFactoryArgs()
      },
    } as SmartAccount<address, true, implementation>)
  }

  return wrap({
    ...implementation,
    get address() {
      if (!address)
        throw new Error(
          '`account.setup()` must be called or `address` must be passed before accessing `account.address`.',
        )
      return address
    },
    async initialize(client_) {
      client = client_
      implementation = parameters.implementation({ address, client })
      address = await implementation.getAddress()
      return wrap({ ...implementation, ...this })
    },
    get initialized() {
      return Boolean(implementation)
    },
    async isDeployed() {
      if (deployed) return true
      if (!implementation) return false
      if (!client) return false
      const bytecode = await getBytecode(client, {
        address: await implementation.getAddress(),
      })
      deployed = Boolean(bytecode)
      return deployed
    },
    type: 'smart',
  } as SmartAccount<address, true, implementation>) as ToSmartAccountReturnType<
    address,
    client,
    implementation
  >
}
