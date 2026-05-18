import type { Account } from '../../../accounts/types.js'
import { getTransactionReceipt } from '../../../actions/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Chain } from '../../../types/chain.js'
import type { Hash } from '../../../types/misc.js'
import { isAddressEqual, toFunctionHash } from '../../../utils/index.js'
import { l1MessengerAddress } from '../../constants/address.js'
import type { ZksyncLog } from '../../types/log.js'
import type { ZksyncTransactionReceipt } from '../../types/transaction.js'

export type GetWithdrawalLogParameters = {
  /** Hash of the L2 transaction where the withdrawal was initiated. */
  hash: Hash
  /** In case there were multiple withdrawals in one transaction, you may pass an index of the
     withdrawal you want to finalize. */
  index?: number | undefined
}

export type GetWithdrawalLogReturnType = {
  log: ZksyncLog
  l1BatchTxId: bigint | null
}

/** @internal */
export async function getWithdrawalLog<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetWithdrawalLogParameters,
): Promise<GetWithdrawalLogReturnType> {
  const { hash, index = 0 } = parameters
  const receipt = (await getTransactionReceipt(client, {
    hash,
  })) as ZksyncTransactionReceipt
  const log = receipt.logs.filter(
    (log) =>
      isAddressEqual(log.address, l1MessengerAddress) &&
      log.topics[0] === toFunctionHash('L1MessageSent(address,bytes32,bytes)'),
  )[index]

  return {
    log,
    l1BatchTxId: receipt.l1BatchTxIndex,
  }
}
