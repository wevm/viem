import { getTransaction } from '../../../actions/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { TransactionReceipt } from '../../../types/transaction.js'
import { getMainContractAddress } from '../../actions/getMainContractAddress.js'
import { DEFAULT_POLLING_INTERVAL_MS } from '../../constants/number.js'
import { getL2HashFromPriorityOp } from './getL2HashFromPriorityOp.js'
import {
  TransactionStatus,
  getTransactionStatusL2,
} from './getTransactionStatusL2.js'

export type GetL2TransactionFromPriorityOpParameters = {
  l1TransactionReceipt: TransactionReceipt
}

export async function getL2TransactionFromPriorityOp<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL2: Client<Transport, TChain, TAccount>,
  parameters: GetL2TransactionFromPriorityOpParameters,
) {
  const zksyncMainContractAddress = await getMainContractAddress(clientL2)

  const l2Hash = await getL2HashFromPriorityOp({
    l1TransactionReceipt: parameters.l1TransactionReceipt,
    zksyncMainContractAddress: zksyncMainContractAddress,
  })

  let status = null
  do {
    status = await getTransactionStatusL2(clientL2, { txHash: l2Hash })
    if (status === TransactionStatus.NotFound) {
      await new Promise((resolve) =>
        setTimeout(resolve, DEFAULT_POLLING_INTERVAL_MS),
      )
    }
  } while (status === TransactionStatus.NotFound)

  return await getTransaction(clientL2, { hash: l2Hash })
}
