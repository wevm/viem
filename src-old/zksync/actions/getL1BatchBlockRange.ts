import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { hexToNumber } from '../../utils/encoding/fromHex.js'
import type { PublicZksyncRpcSchema } from '../types/eip1193.js'

export type GetL1BatchBlockRangeParameters = {
  l1BatchNumber: number
}

export type GetL1BatchBlockRangeReturnParameters = [number, number]

export async function getL1BatchBlockRange<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZksyncRpcSchema>,
  parameters: GetL1BatchBlockRangeParameters,
): Promise<GetL1BatchBlockRangeReturnParameters> {
  const [number_1, number_2] = await client.request({
    method: 'zks_getL1BatchBlockRange',
    params: [parameters.l1BatchNumber],
  })
  return [hexToNumber(number_1), hexToNumber(number_2)]
}
