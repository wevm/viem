import type { Address } from 'abitype'
import { getTransactionReceipt } from '../../actions/index.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { isAddressEqualLite } from '../../utils/address/isAddressEqualLite.js'
import { BOOTLOADER_FORMAL_ADDRESS } from '../constants/number.js'
import type { ZkSyncTransactionReceipt } from '../types/transaction.js'
import type { GetPriorityOpConfirmationParameters } from './getPriorityOpConfirmation.js'

export async function getPriorityOpConfirmationL2ToL1Log<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL2: Client<Transport, TChain, TAccount>,
  parameters: GetPriorityOpConfirmationParameters,
) {
  const receipt = (await getTransactionReceipt(clientL2, {
    hash: parameters.txHash,
  })) as ZkSyncTransactionReceipt

  const messages = Array.from(receipt.l2ToL1Logs.entries()).filter(([, log]) =>
    isAddressEqualLite(log.sender as Address, BOOTLOADER_FORMAL_ADDRESS),
  )
  const [l2ToL1LogIndex, l2ToL1Log] = messages[parameters.index]

  return {
    l2ToL1LogIndex,
    l2ToL1Log,
    l1BatchTxId: receipt.l1BatchTxIndex,
  }
}
