import { getBlock, getTransactionReceipt } from '../../../actions/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hash } from '../../../types/misc.js'
import type { TransactionReceipt } from '../../../types/transaction.js'

export type WaitFinalizeParameters = {
  hash: Hash
}

export type WaitFinalizeReturnType = TransactionReceipt

export async function waitFinalize<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  parameters: WaitFinalizeParameters,
): Promise<WaitFinalizeReturnType> {
  while (true) {
    let receipt: TransactionReceipt
    try {
      receipt = await getTransactionReceipt(client, {
        hash: parameters.hash,
      })
      if (receipt?.blockNumber) {
        const block = await getBlock(client, { blockTag: 'finalized' })
        if (receipt.blockNumber <= block!.number) {
          return receipt
        }
      } else {
        return new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (_e) {
      // do nothing...
    }
  }
}
