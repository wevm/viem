export type ZkSyncFee<TQuantity = bigint> = {
  gasLimit: TQuantity
  gasPerPubdataLimit: TQuantity
  maxPriorityFeePerGas: TQuantity
  maxFeePerGas: TQuantity
}

export type ZkSyncFeeValues<TQuantity = bigint> = {
  gasPrice: TQuantity
  maxFeePerGas: TQuantity
  maxPriorityFeePerGas: TQuantity
}
