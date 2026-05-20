import type * as Address from 'ox/Address'
import * as Hex from 'ox/Hex'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import type * as Block from '../../utils/Block.js'

/**
 * Returns the bytecode at an address.
 *
 * @example
 * ```ts twoslash
 * import { Client, http } from 'viem'
 * import * as actions from 'viem/actions'
 *
 * const client = Client.create({
 *   transport: http('https://1.rpc.thirdweb.com'),
 * })
 *
 * const code = await actions.public.getCode(client, {
 *   address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
 * })
 * // @log: undefined
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Bytecode, if found.
 */
export async function getCode<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(client: Client.Client<chain>, options: getCode.Options): getCode.ReturnType {
  const { address, blockNumber, blockTag = 'latest' } = options
  const code = await client.request(
    {
      method: 'eth_getCode',
      params: [
        address,
        blockNumber !== undefined ? Hex.fromNumber(blockNumber) : blockTag,
      ],
    },
    { dedupe: blockNumber !== undefined },
  )
  if (code === '0x') return undefined
  return code as Hex.Hex
}

export declare namespace getCode {
  type Options = {
    /** Account address. */
    address: Address.Address
  } & (
    | {
        /** Block number. */
        blockNumber?: bigint | undefined
        blockTag?: undefined
      }
    | {
        blockNumber?: undefined
        /** Block tag. */
        blockTag?: Block.Tag | undefined
      }
  )

  type ReturnType = Promise<Hex.Hex | undefined>

  type ErrorType = Hex.fromNumber.ErrorType
}
