import type { Address } from 'abitype'
import { getTransactionReceipt } from '../../../actions/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { isAddressEqualLite } from '../../../utils/address/isAddressEqualLite.js'
import { l1MessengerAddress } from '../../../zksync/constants/address.js'
import type { ZkSyncTransactionReceipt } from '../../types/transaction.js'

export type GetWithdrawalL2ToL1LogParameters = {
  withdrawalHash: Hex
  index: number
}

export async function getWithdrawalL2ToL1Log<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL2: Client<Transport, TChain, TAccount>,
  parameters: GetWithdrawalL2ToL1LogParameters,
): Promise<any> {
  const receipt = (await getTransactionReceipt(clientL2, {
    hash: parameters.withdrawalHash,
  })) as ZkSyncTransactionReceipt
  const messages = Array.from(receipt.l2ToL1Logs.entries()).filter(([, log]) =>
    isAddressEqualLite(log.sender as Address, l1MessengerAddress),
  )
  const [l2ToL1LogIndex, l2ToL1Log] = messages[parameters.index]

  return {
    l2ToL1LogIndex,
    l2ToL1Log,
  }
}
