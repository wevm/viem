import * as AbiFunction from 'ox/AbiFunction'
import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import { z } from 'ox/zod'

import type * as Client from '../../Client.js'
import {
  type RequireCanonicalError,
  blockParameter,
} from '../internal/blockParameter.js'
import { getMulticallAddress } from '../internal/multicall.js'
import { call } from './call.js'

const getEthBalanceAbi = /*#__PURE__*/ AbiFunction.from(
  'function getEthBalance(address addr) returns (uint256 balance)',
)

/**
 * Returns the balance of an address in wei.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const balance = await Actions.getBalance(client, {
 *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 * })
 * ```
 */
export async function getBalance(
  client: Client.Client,
  options: getBalance.Options,
): Promise<getBalance.ReturnType> {
  const { address, ...block } = options

  if (client.batch?.multicall) {
    const multicallAddress = getMulticallAddress(client, {
      blockNumber: block.blockNumber,
    })
    if (multicallAddress) {
      const { data } = await call(client, {
        ...block,
        data: AbiFunction.encodeData(getEthBalanceAbi, [address]),
        to: multicallAddress,
      })
      return AbiFunction.decodeResult(getEthBalanceAbi, data ?? '0x')
    }
  }

  const schema = z.RpcSchema.parseItem(z.RpcSchema.Eth, 'eth_getBalance')
  const balance = await client.request({
    method: 'eth_getBalance',
    params: z.RpcSchema.encodeParams(schema, [
      address,
      blockParameter({
        ...block,
        blockTag: block.blockTag ?? client.blockTag ?? 'latest',
      }),
    ]),
  })
  return z.RpcSchema.decodeReturns(schema, balance)
}

export declare namespace getBalance {
  type Options = {
    /** The Account address. */
    address: Address.Address
  } & blockParameter.BlockOptions

  type ReturnType = bigint

  type ErrorType = RequireCanonicalError | Errors.GlobalErrorType
}
