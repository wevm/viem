import { getBlock, getTransaction } from '../../actions/index.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'

export enum TransactionStatus {
  NotFound = 'not-found',
  Processing = 'processing',
  Committed = 'committed',
  Finalized = 'finalized',
}

export async function getTransactionStatusL2<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL2: Client<Transport, TChain, TAccount>,
  txHash: Hash,
): Promise<TransactionStatus> {
  try {
    const tx = await getTransaction(clientL2, { hash: txHash })
    if (!tx) {
      return TransactionStatus.NotFound
    }
    if (!tx.blockNumber) {
      return TransactionStatus.Processing
    }
    const verifiedBlock = await getBlock(clientL2, { blockTag: 'finalized' })
    if (tx.blockNumber <= verifiedBlock.number) {
      return TransactionStatus.Finalized
    }
  } catch (_) {
    return TransactionStatus.NotFound
  }
  return TransactionStatus.Committed
}
