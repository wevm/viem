import type { Address } from 'abitype'
import type { Hash, Hex } from '../../types/misc.js'
import type { ZksyncBatchDetails, ZksyncBlockDetails } from './block.js'
import type { ZksyncFee } from './fee.js'
import type { MessageProof } from './proof.js'
import type {
  TransactionRequest,
  ZksyncTransactionDetails,
} from './transaction.js'

export type CommonDataRawBlockTransaction = {
  sender: Address
  maxFeePerGas: Hex
  gasLimit: Hex
  gasPerPubdataLimit: Hex
  ethHash: Hash
  ethBlock: number
  canonicalTxHash: Hash
  toMint: Hex
  refundRecipient: Address
}

export type RawBlockTransactions = {
  common_data: {
    L1?:
      | ({
          serialId: number
          deadlineBlock: number
          layer2TipFee: Hex
          fullFee: Hex
          opProcessingType: string
          priorityQueueType: string
        } & CommonDataRawBlockTransaction)
      | undefined
    L2?:
      | {
          nonce: number
          fee: ZksyncFee<Hex>
          initiatorAddress: Address
          signature: Uint8Array
          transactionType: string
          input?: {
            hash: Hash
            data: Uint8Array
          }
          paymasterParams: {
            paymaster: Address
            paymasterInput: Uint8Array
          }
        }
      | undefined
    ProtocolUpgrade?:
      | ({
          upgradeId: string
        } & CommonDataRawBlockTransaction)
      | undefined
  }
  execute: {
    calldata: Hash
    contractAddress: Address
    factoryDeps?: Hash
    value: bigint
  }
  received_timestamp_ms: number
  raw_bytes?: string
}[]

export type PublicZksyncRpcSchema = [
  {
    Method: 'zks_estimateFee'
    Parameters: [TransactionRequest]
    ReturnType: {
      gas_limit: Hex
      gas_per_pubdata_limit: Hex
      max_fee_per_gas: Hex
      max_priority_fee_per_gas: Hex
    }
  },
  {
    Method: 'zks_estimateGasL1ToL2'
    Parameters: [TransactionRequest]
    ReturnType: bigint
  },
  {
    Method: 'zks_getBridgeContracts'
    Parameters?: undefined
    ReturnType: {
      l1Erc20DefaultBridge: Address
      l2Erc20DefaultBridge: Address
      l1WethBridge: Address
      l2WethBridge: Address
      l1SharedDefaultBridge: Address
      l2SharedDefaultBridge: Address
      l1Nullifier?: Address
      l1NativeTokenVault?: Address
    }
  },
  {
    Method: 'zks_getAllAccountBalances'
    Parameters: [Address]
    ReturnType: { [key: Address]: Hex }
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
    ReturnType: [Hex, Hex]
  },
  {
    Method: 'zks_getL1BatchDetails'
    Parameters: [number]
    ReturnType: ZksyncBatchDetails
  },
  {
    Method: 'zks_getRawBlockTransactions'
    Parameters: [number]
    ReturnType: RawBlockTransactions
  },
  {
    Method: 'zks_getBlockDetails'
    Parameters: [number]
    ReturnType: ZksyncBlockDetails
  },
  {
    Method: 'zks_getTransactionDetails'
    Parameters: [Hash]
    ReturnType: ZksyncTransactionDetails
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
  {
    Method: 'zks_gasPerPubdata'
    Parameters?: undefined
    ReturnType: Hex
  },
]
