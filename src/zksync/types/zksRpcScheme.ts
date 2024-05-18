import type { Address } from 'abitype'
import type { Account } from '../../types/account.js'
import type { Hash, Hex } from '../../types/misc.js'
import type {
  ChainEIP712,
  GetL1BatchBlockRangeReturnParameters,
} from '../../zksync/index.js'
import type { EstimateFeeParameters, Fee } from '../actions/estimateFee.js'
import type { BaseBlockDetails } from '../actions/getBlockDetails.js'
import type { BatchDetails } from '../actions/getL1BatchDetails.js'
import type { MessageProof } from '../actions/getLogProof.js'
import type { RawBlockTransactions } from '../actions/getRawBlockTransaction.js'
import type { TransactionDetails } from '../actions/getTransactionDetails.js'
import type { ZkSyncTransactionRequestParameters } from './transaction.js'

type ZksGetAllBalancesReturnType = { [key: string]: string }

type ZksDefaultBridgeAddressesReturnType = {
  l1Erc20DefaultBridge: Address
  l2Erc20DefaultBridge: Address
  l1WethBridge: Address
  l2WethBridge: Address
  l1SharedDefaultBridge: Address
  l2SharedDefaultBridge: Address
}

export type PublicZkSyncRpcSchema<
  TChain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  TAccount extends Account | undefined = Account | undefined,
> = [
  {
    Method: 'zks_estimateFee'
    Parameters: [EstimateFeeParameters<TChain, TAccount>]
    ReturnType: Fee
  },
  {
    Method: 'zks_estimateGasL1ToL2'
    Parameters: [ZkSyncTransactionRequestParameters<TChain, TAccount>]
    ReturnType: bigint
  },
  {
    Method: 'zks_getBridgeContracts'
    Parameters?: undefined
    ReturnType: ZksDefaultBridgeAddressesReturnType
  },
  {
    Method: 'zks_getAllAccountBalances'
    Parameters: [Address]
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
    ReturnType: Hex
  },
  {
    Method: 'zks_getMainContract'
    Parameters: undefined
    ReturnType: Address
  },
  {
    Method: 'zks_L1BatchNumber'
    Parameters: undefined
    ReturnType: Hex
  },
  {
    Method: 'zks_getL2ToL1LogProof'
    Parameters: [Hash, number | undefined]
    ReturnType: MessageProof
  },
  {
    Method: 'zks_getL1BatchBlockRange'
    Parameters: [number]
    ReturnType: GetL1BatchBlockRangeReturnParameters
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
    Method: 'zks_getBaseTokenL1Address'
    Parameters: undefined
    ReturnType: Address
  },
]
