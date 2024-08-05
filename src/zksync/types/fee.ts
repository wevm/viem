export type ZksyncFee<quantity = bigint> = {
  gasLimit: quantity
  gasPerPubdataLimit: quantity
  maxPriorityFeePerGas: quantity
  maxFeePerGas: quantity
}
/** @deprecated Use `ZksyncFee` instead */
export type ZkSyncFee = ZksyncFee

export type ZksyncFeeValues<quantity = bigint> = {
  gasPrice: quantity
  maxFeePerGas: quantity
  maxPriorityFeePerGas: quantity
}
/** @deprecated Use `ZksyncFeeValues` instead */
export type ZkSyncFeeValues = ZksyncFeeValues
