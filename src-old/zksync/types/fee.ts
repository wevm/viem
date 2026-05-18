export type ZksyncFee<quantity = bigint> = {
  gasLimit: quantity
  gasPerPubdataLimit: quantity
  maxPriorityFeePerGas: quantity
  maxFeePerGas: quantity
}

export type ZksyncFeeValues<quantity = bigint> = {
  gasPrice: quantity
  maxFeePerGas: quantity
  maxPriorityFeePerGas: quantity
}
