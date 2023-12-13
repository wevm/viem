export type Withdrawal = {
  nonce: bigint
  sender: `0x${string}`
  target: `0x${string}`
  value: bigint
  gasLimit: bigint
  data: `0x${string}`
  withdrawalHash: `0x${string}`
}
