import type { Address } from 'abitype'
import {
  getTransaction,
  getTransactionReceipt,
} from '../../../actions/index.js'
import type { ZkSyncTransactionReceipt } from '../../../chains/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { zeroHash } from '../../../constants/bytes.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { isAddressEqualLite } from '../../../utils/address/isAddressEqualLite.js'
import { decodeFunctionData, encodeFunctionData } from '../../../utils/index.js'
import {
  l1SharedBridgeAbi,
  l2BridgeAbi,
} from '../../../zksync/constants/abis.js'
import { bootloaderFormalAddress } from '../../../zksync/constants/address.js'
import type { Overrides } from '../../../zksync/types/deposit.js'
import { getLogProof } from '../withdraw/getLogProof.js'
import { undoL1ToL2Alias } from './undoL1ToL2Alias.js'

export type ClaimFailedDepositParameters = {
  depositHash: Hex
  overrides?: Overrides
}

export type ClaimFailedDepositReturnType = {
  data: Hex
  to: Address
  value?: bigint
}

export async function getClaimFailedDepositArgs<
  TChainL2 extends Chain | undefined,
>(
  clientL2: Client<Transport, TChainL2, Account>,
  parameters: ClaimFailedDepositParameters,
): Promise<ClaimFailedDepositReturnType> {
  const receipt = (await getTransactionReceipt(clientL2, {
    hash: parameters.depositHash,
  })) as ZkSyncTransactionReceipt
  if (!receipt) {
    throw new Error('Transaction is not mined!')
  }
  const successL2ToL1LogIndex = receipt.l2ToL1Logs.findIndex(
    (l2ToL1log) =>
      isAddressEqualLite(
        l2ToL1log.sender as Address,
        bootloaderFormalAddress,
      ) && l2ToL1log.key === parameters.depositHash,
  )

  const successL2ToL1Log = receipt.l2ToL1Logs[successL2ToL1LogIndex]
  if (successL2ToL1Log.value !== zeroHash) {
    throw new Error('Cannot claim successful deposit!')
  }

  const tx = await getTransaction(clientL2, { hash: parameters.depositHash })

  const l1BridgeAddress = undoL1ToL2Alias({ address: receipt.from as Address })
  const l2BridgeAddress = receipt.to
  if (!l2BridgeAddress) {
    throw new Error('L2 bridge address not found!')
  }
  const calldata = decodeFunctionData({
    abi: l2BridgeAbi,
    data: tx.input,
  }) as any

  const proof = await getLogProof(clientL2, {
    txHash: parameters.depositHash,
    index: successL2ToL1LogIndex,
  })

  if (!proof) {
    throw new Error('Log proof not found!')
  }

  const l1Sender = calldata.args[0]
  const l1Token = calldata.args[2]
  const amount = calldata.args[3]

  const data = encodeFunctionData({
    abi: l1SharedBridgeAbi,
    functionName: 'claimFailedDeposit',
    args: [
      BigInt(clientL2.chain?.id!),
      l1Sender,
      l1Token,
      amount,
      parameters.depositHash,
      receipt.l1BatchNumber!,
      BigInt(proof.id),
      Number(receipt.l1BatchTxIndex!),
      proof.proof,
    ],
  })

  return {
    data,
    to: l1BridgeAddress,
    value: 0n,
  }
}
