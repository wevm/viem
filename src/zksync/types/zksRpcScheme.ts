import type { Address } from 'abitype'
import type { Hash } from '../../types/misc.js'
import type { ZkSyncTransactionRequest } from '../../zksync/index.js'
import type { Fee } from '../actions/estimateFee.js'
import type { ZksGetAllBalancesReturnType } from '../actions/getAllBalances.js'
import type { BaseBlockDetails } from '../actions/getBlockDetails.js'
import type { ZksBridgeContractsReturnType } from '../actions/getDefaultBridgeAddress.js'
import type { BatchDetails } from '../actions/getL1BatchDetails.js'
import type { MessageProof } from '../actions/getLogProof.js'
import type { RawBlockTransactions } from '../actions/getRawBlockTransaction.js'
import type { TransactionDetails } from '../actions/getTransactionDetails.js'

export type PublicZkSyncRpcSchema = [
  {
    Method: 'zks_getBridgeContracts'
    Parameters?: undefined
    ReturnType: ZksBridgeContractsReturnType
  },
  {
    Method: 'zks_getAllAccountBalances'
    Parameters: [Hash]
    ReturnType: ZksGetAllBalancesReturnType
  },
  {
    Method: 'zks_getTestnetPaymaster'
    Parameters: undefined
    ReturnType: Address
  },
  {
    Method: 'zks_L1ChainId'
    Parameters: undefined
    ReturnType: number
  },
  {
    Method: 'zks_getMainContract'
    Parameters: undefined
    ReturnType: Address
  },
  {
    Method: 'zks_L1BatchNumber'
    Parameters: undefined
    ReturnType: number
  },
  {
    Method: 'zks_getL2ToL1LogProof'
    Parameters: [Hash, number | undefined]
    ReturnType: MessageProof
  },
  {
    Method: 'zks_getL1BatchBlockRange'
    Parameters: [number]
    ReturnType: [number, number]
  },
  {
    Method: 'zks_getL1BatchDetails'
    Parameters: [number]
    ReturnType: BatchDetails
  },
  {
    Method: 'zks_getRawBlockTransactions'
    Parameters: [number]
    ReturnType: RawBlockTransactions
  },
  {
    Method: 'zks_getBlockDetails'
    Parameters: [number]
    ReturnType: BaseBlockDetails
  },
  {
    Method: 'zks_getTransactionDetails'
    Parameters: [Hash]
    ReturnType: TransactionDetails
  },
  {
    Method: 'zks_getBridgehubContract'
    Parameters: undefined
    ReturnType: Address
  },
  {
    Method: 'zks_estimateFee'
    Parameters: [ZkSyncTransactionRequest]
    ReturnType: Fee
  },
  {
    Method: 'zks_getBaseTokenL1Address'
    Parameters: undefined
    ReturnType: Address
  },
]
