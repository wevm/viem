import type { Transport } from '../../clients/transports/createTransport.js'
import type { ChainEIP712 } from '../types/chain.js'
import type { Client } from '../../clients/createClient.js'

export async function getL1ChainId<
  chain extends ChainEIP712 | undefined,
>(
  client: Client<Transport, chain>,
): Promise<number> {
        const result = await client.request({method:"zks_L1ChainId"})
        return result;
}