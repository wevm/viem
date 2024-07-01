import type { Address } from 'abitype'
import type { SendTransactionParameters } from '../../../actions/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hash } from '../../../types/misc.js'
import { isAddressEqualLite } from '../../../utils/address/isAddressEqualLite.js'
import { encodeFunctionData } from '../../../utils/index.js'
import { l2BaseTokenAddress } from '../../../zksync/constants/address.js'
import { getDefaultBridgeAddresses } from '../../actions/getDefaultBridgeAddresses.js'
import { l1Bridge } from '../../actions/l1Bridge.js'
import { sendTransaction } from '../../actions/sendTransaction.js'
import { l1SharedBridgeAbi } from '../../constants/abis.js'
import { getL2WithdawalLogData } from './getL2WithdrawalData.js'
import { isL2BridgeLegacy } from './isL2BridgeLegacy.js'
import { isWithdrawalFinalized } from './isWithdrawalFinalized.js'
import { l1SharedBridge } from './l1SharedBridge.js'
import { waitFinalize } from './waitFinalize.js'

export type FinalizeWithdrawalParameters = {
  txHash: Hash
}

export type FinalizeWithdrawalReturnType = Hash

export async function finalizeWithdrawal<
  TChainL1 extends Chain | undefined,
  TChainL2 extends Chain | undefined,
>(
  clientL1: Client<Transport, TChainL1, Account>,
  clientL2: Client<Transport, TChainL2, Account>,
  parameters: FinalizeWithdrawalParameters,
): Promise<FinalizeWithdrawalReturnType> {
  await waitFinalize(clientL2, { hash: parameters.txHash })

  const defaultBridges = await getDefaultBridgeAddresses(clientL2)

  const logData = await getL2WithdawalLogData(clientL2, {
    hash: parameters.txHash,
    index: 0,
  })

  let bridgeAdr: Address = '0x'

  if (isAddressEqualLite(logData.sender, l2BaseTokenAddress)) {
    bridgeAdr = defaultBridges.sharedL1
  } else if (await isL2BridgeLegacy(clientL2, { address: logData.sender })) {
    bridgeAdr = await l1SharedBridge(clientL2, { address: logData.sender })
  } else {
    bridgeAdr = await l1Bridge(clientL2, { l2BridgeAddress: logData.sender })
  }

  const isWithdrawalFinalizedResult = await isWithdrawalFinalized(clientL1, {
    ...logData,
    l2ChainId: BigInt(clientL2.chain?.id!),
    sharedBridgeAddress: bridgeAdr,
  })

  if (isWithdrawalFinalizedResult) {
    throw new Error('Withdrawal is already finalized.')
  }

  const data = encodeFunctionData({
    abi: l1SharedBridgeAbi,
    functionName: 'finalizeWithdrawal',
    args: [
      BigInt(clientL2.chain!.id),
      logData.log.l1BatchNumber!,
      BigInt(logData.proof.id), //l2MessageIndex
      Number(logData.l1BatchTxId), //l2TxNumberInBlock
      logData.message,
      logData.proof.proof,
    ],
  })

  const finalizeWithdrawalArgs = {
    value: 0n,
    to: bridgeAdr,
    data: data!,
  } as SendTransactionParameters

  return await sendTransaction(clientL1, finalizeWithdrawalArgs)
}
