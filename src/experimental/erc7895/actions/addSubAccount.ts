import type { Address } from 'abitype'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import type { OneOf, Prettify } from '../../../types/utils.js'
import type { RequestErrorType } from '../../../utils/buildRequest.js'
import { numberToHex } from '../../../utils/index.js'

export type AddSubAccountParameters = Prettify<
  OneOf<
    | {
        keys?:
          | readonly {
              publicKey: Hex
              type: 'address' | 'p256' | 'webcrypto-p256' | 'webauthn-p256'
            }[]
          | undefined
        type: 'create'
      }
    | {
        address: Address
        chainId?: number | undefined
        type: 'deployed'
      }
    | {
        address: Address
        chainId?: number | undefined
        factory: Address
        factoryData: Hex
        type: 'undeployed'
      }
  >
>

export type AddSubAccountReturnType = Prettify<{
  address: Address
  factory?: Address | undefined
  factoryData?: Hex | undefined
}>

export type AddSubAccountErrorType = RequestErrorType

/**
 * Requests to add a Sub Account.
 *
 * - Docs: https://viem.sh/experimental/erc7895/addSubAccount
 * - JSON-RPC Methods: [`wallet_addSubAccount`](https://github.com/ethereum/ERCs/blob/abd1c9f4eda2d6ad06ade0e3af314637a27d1ee7/ERCS/erc-7895.md)
 *
 * @param client - Client to use
 * @param parameters - {@link AddSubAccountParameters}
 * @returns Sub Account. {@link AddSubAccountReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addSubAccount } from 'viem/experimental/erc7895'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const response = await addSubAccount(client, {
 *   keys: [{ publicKey: '0x0000000000000000000000000000000000000000', type: 'address' }],
 *   type: 'create',
 * })
 */
export async function addSubAccount<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: AddSubAccountParameters,
): Promise<AddSubAccountReturnType> {
  return client.request({
    method: 'wallet_addSubAccount',
    params: [
      {
        account: {
          ...parameters,
          ...(parameters.chainId
            ? { chainId: numberToHex(parameters.chainId) }
            : {}),
        } as never,
        version: '1',
      },
    ],
  })
}
