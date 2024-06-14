import type { LineaEstimateGasReturnType } from './fee.js'

export type LineaEstimateGasRpcSchema =
  /**
   * @description Returns the gasLimit, baseFeePerGas and priorityFeePerGas
   * on the linea chain
   *
   * @example
   * provider.request({ method: 'linea_estimateGas'
   * ,"params":[{"from":"0x42c27251C710864Cf76f1b9918Ace3E585e6E21b"
   * ,"value":"0x1","gasPrice":"0x100000000","gas":"0x21000"}] })
   * // => {"jsonrpc":"2.0","id":53,"result":{"baseFeePerGas":"0x7","gasLimit":"0xcf08","priorityFeePerGas":"0xa92469a"}}
   */
  {
    Method: 'linea_estimateGas'
    Parameters?: any
    ReturnType: LineaEstimateGasReturnType
  }