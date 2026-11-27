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
      | [transaction: RpcTransactionRequest, stateOverride: RpcStateOverride]
    ReturnType: {
      gasLimit: Hex
      baseFeePerGas: Hex
      priorityFeePerGas: Hex
    }
  },
]
