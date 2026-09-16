import type { BlockNumber, BlockTag } from '../../types/block.js'
import type { Hex } from '../../types/misc.js'
import type {
  RpcStateOverride,
  RpcTransactionRequest,
} from '../../types/rpc.js'

export type LineaRpcSchema = [
  {
    Method: 'linea_estimateGas'
    Parameters?:
      | [transaction: RpcTransactionRequest]
      | [
          transaction: RpcTransactionRequest,
          block: Hex | BlockNumber | BlockTag,
        ]
      | [transaction: RpcTransactionRequest, stateOverride: RpcStateOverride]
      | [
          transaction: RpcTransactionRequest,
          block: Hex | BlockNumber | BlockTag,
          stateOverride: RpcStateOverride,
        ]
    ReturnType: {
      gasLimit: Hex
      baseFeePerGas: Hex
      priorityFeePerGas: Hex
    }
  },
]
