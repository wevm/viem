import type * as Address from 'ox/Address'
import * as Hex from 'ox/Hex'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { toRpcBlock } from './internal/toRpcBlock.js'

/**
 * Returns the bytecode at an address.
 *
 * @example
 * ```ts twoslash
 * import { Client, actions, http } from 'viem'
 *
 * const client = Client.create({
 *   transport: http('https://1.rpc.thirdweb.com'),
 * })
 *
 * const code = await actions.getCode(client, {
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
  const { address, ...block } = options
  const code = await client.request(
    {
      method: 'eth_getCode',
      params: [address, toRpcBlock(block)],
    },
    { dedupe: block.blockNumber !== undefined },
  )
  if (code === '0x') return undefined
  return code
}

export declare namespace getCode {
  type Options = {
    /** Account address. */
    address: Address.Address
  } & toRpcBlock.Options

  type ReturnType = Promise<Hex.Hex | undefined>

  type ErrorType = toRpcBlock.ErrorType
}
