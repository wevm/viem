import type { Address } from 'abitype'
import { readContract } from '../../actions/index.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { l1SharedBridgeAbi } from '../constants/abis.js'
import type { ZkSyncLog } from '../types/log.js'
import type { MessageProof } from '../types/proof.js'

export type IsWithdrawalFinalizedParameters = {
  l2ChainId: bigint
  log: ZkSyncLog
  sharedBridgeAddress: Address
  proof: MessageProof
}
export type IsWithdrawalFinalizedReturnType = boolean

export async function isWithdrawalFinalized<TChainL1 extends Chain | undefined>(
  clientL1: Client<Transport, TChainL1, Account>,
  parameters: IsWithdrawalFinalizedParameters,
): Promise<IsWithdrawalFinalizedReturnType> {
  return (await readContract(clientL1, {
    abi: l1SharedBridgeAbi,
    functionName: 'isWithdrawalFinalized',
    address: parameters.sharedBridgeAddress,
    args: [
      parameters.l2ChainId,
      parameters.log.l1BatchNumber!,
      BigInt(parameters.proof.id!),
    ],
  })) as boolean
}
