import type { Transport } from '../../clients/transports/createTransport.js'
import type { ChainEIP712 } from '../types/chain.js'
import type { Client } from '../../clients/createClient.js'
import type { Hash } from '~viem/types/misc.js';

export type MessageProof = {
  id: number;
  proof: string[];
  root: string;
}

export type GetLogProofParameters ={
  txHash:Hash,
  index?:number
}

export async function getLogProof<
  chain extends ChainEIP712 | undefined,
>(
  client: Client<Transport, chain>,
  parameters:GetLogProofParameters
): Promise<MessageProof | null> {
        const result = await client.request({method:"zks_getL2ToL1LogProof",params:[parameters.txHash,parameters.index]})
        return result;
}