export type ZkSyncFee<quantity = bigint> = {
  gasLimit: quantity
  gasPerPubdataLimit: quantity
  maxPriorityFeePerGas: quantity
  maxFeePerGas: quantity
}

export type ZkSyncFeeValues<quantity = bigint> = {
  gasPrice: quantity
  maxFeePerGas: quantity
  maxPriorityFeePerGas: quantity
}
