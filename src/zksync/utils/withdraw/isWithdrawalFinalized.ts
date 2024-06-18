import type { Address } from 'abitype'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import { isWithdrawalFinalized as isWithdrawalFinalizedAction } from '../../actions/isWithdrawalFinalized.js'
import type { GetL2WithdawalLogDataReturnType } from './getL2WithdrawalData.js'

export type IsWithdrawalFinalizedParameters =
  GetL2WithdawalLogDataReturnType & {
    l2ChainId: bigint
    sharedBridgeAddress: Address
  }
export type IsWithdrawalFinalizedReturnType = boolean

export async function isWithdrawalFinalized<TChainL1 extends Chain | undefined>(
  clientL1: Client<Transport, TChainL1, Account>,
  parameters: IsWithdrawalFinalizedParameters,
): Promise<IsWithdrawalFinalizedReturnType> {
  return (await isWithdrawalFinalizedAction(clientL1, {
    l2ChainId: parameters.l2ChainId,
    proof: parameters.proof,
    log: parameters.log,
    sharedBridgeAddress: parameters.sharedBridgeAddress,
  })) as boolean
}
