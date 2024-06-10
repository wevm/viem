import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hash } from '../../../types/misc.js'
import { getLogProof } from '../../actions/getLogProof.js'
import { getPriorityOpConfirmationL2ToL1Log } from './getPriorityOpConfirmationL2ToL1Log.js'

export type GetPriorityOpConfirmationParameters = {
  txHash: Hash
  index: number
}

export type GetPriorityOpConfirmationReturnType = {
  l1BatchNumber: bigint
  l2MessageIndex: number
  l2TxNumberInBlock: bigint | null
  proof: Hash[]
}

export async function getPriorityOpConfirmation<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL2: Client<Transport, TChain, TAccount>,
  parameters: GetPriorityOpConfirmationParameters,
) {
  const { l2ToL1LogIndex, l2ToL1Log, l1BatchTxId } =
    await getPriorityOpConfirmationL2ToL1Log(clientL2, parameters)
  const proof = await getLogProof(clientL2, {
    txHash: parameters.txHash,
    index: l2ToL1LogIndex,
  })
  return {
    l1BatchNumber: l2ToL1Log.l1BatchNumber,
    l2MessageIndex: proof!.id,
    l2TxNumberInBlock: l1BatchTxId,
    proof: proof!.proof,
  }
}
