import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hash } from '../../../types/misc.js'
import { sendTransaction } from '../../actions/sendTransaction.js'
import type { WithdrawTransaction } from './../../types/withdraw.js'
import { createWithdrawSpecification } from './createWithdrawSpecification.js'
import { getWithdrawArgs } from './getWithdrawTxArgs.js'

export type InitiateWithdrawalParameters = WithdrawTransaction

export type InitiateWithdrawalReturnType = Hash

export async function initiateWithdrawal<
  TChainL1 extends Chain | undefined,
  TChainL2 extends Chain | undefined,
>(
  clientL1: Client<Transport, TChainL1, Account>,
  clientL2: Client<Transport, TChainL2, Account>,
  parameters: InitiateWithdrawalParameters,
): Promise<InitiateWithdrawalReturnType> {
  const withdrawSpecification = await createWithdrawSpecification(
    clientL2,
    parameters,
  )

  const args = await getWithdrawArgs(clientL1, withdrawSpecification)

  const hash = await sendTransaction(clientL2, args)

  return hash
}
