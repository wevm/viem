import type { Address } from 'abitype'
import type { Account } from '../../types/account.js'
import type { FeeValues } from '../../types/fee.js'
import type { Hash, Hex } from '../../types/misc.js'
import type {
  ChainEIP712,
  GetBlockDetailsReturnType,
  GetL1BatchBlockRangeReturnParameters,
  GetTransactionDetailsReturnType,
} from '../../zksync/index.js'
import type { EstimateFeeParameters } from '../actions/estimateFee.js'
import type { EstimateGasL1ToL2Parameters } from '../actions/estimateGasL1ToL2.js'
import type { GetBaseTokenL1AddressReturnType } from '../actions/getBaseTokenL1Address.js'
import type { GetBridgehubContractAddressReturnType } from '../actions/getBridgehubContractAddress.js'
import type { RawBlockTransactions } from '../actions/getRawBlockTransaction.js'
import type { ZkSyncBatchDetails } from './block.js'
import type { MessageProof } from './proof.js'

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
    ReturnType: FeeValues
  },
  {
    Method: 'zks_estimateGasL1ToL2'
    Parameters: [EstimateGasL1ToL2Parameters<TChain, TAccount>]
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
    ReturnType: ZkSyncBatchDetails
  },
  {
    Method: 'zks_getRawBlockTransactions'
    Parameters: [number]
    ReturnType: RawBlockTransactions
  },
  {
    Method: 'zks_getBlockDetails'
    Parameters: [number]
    ReturnType: GetBlockDetailsReturnType
  },
  {
    Method: 'zks_getTransactionDetails'
    Parameters: [Hash]
    ReturnType: GetTransactionDetailsReturnType
  },
  {
    Method: 'zks_getBridgehubContract'
    Parameters: undefined
    ReturnType: GetBridgehubContractAddressReturnType
  },
  {
    Method: 'zks_getBaseTokenL1Address'
    Parameters: undefined
    ReturnType: GetBaseTokenL1AddressReturnType
  },
]
