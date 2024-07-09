import type { Address } from 'abitype'
import { getTransactionReceipt } from '../../../actions/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { isAddressEqualLite } from '../../../utils/address/isAddressEqualLite.js'
import { toFunctionSelector } from '../../../utils/index.js'
import { l1MessengerAddress } from '../../../zksync/constants/address.js'
import type { ZkSyncLog } from '../../types/log.js'
import type { ZkSyncTransactionReceipt } from '../../types/transaction.js'

export type GetWithdrawalLogParameters = {
  withdrawalHash: Hex
  index: number
}

export type GetWithdrawalLogReturnType = {
  log: ZkSyncLog
  l1BatchTxId: bigint
}

export async function getWithdrawalLog<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL2: Client<Transport, TChain, TAccount>,
  parameters: GetWithdrawalLogParameters,
): Promise<GetWithdrawalLogReturnType> {
  const receipt = (await getTransactionReceipt(clientL2, {
    hash: parameters.withdrawalHash,
  })) as ZkSyncTransactionReceipt
  const log = receipt.logs.filter((log) => {
    const isMatchingAddress = isAddressEqualLite(
      log.address as Address,
      l1MessengerAddress,
    )
    const isMatchingTopic = log.topics[0]?.startsWith(
      toFunctionSelector('L1MessageSent(address,bytes32,bytes)'),
    )

    return isMatchingAddress && isMatchingTopic
  })[parameters.index]

  return {
    log,
    l1BatchTxId: receipt.l1BatchTxIndex!,
  }
}
