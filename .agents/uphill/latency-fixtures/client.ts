/** Stand-ins for viem actions, so the fixtures type-check without a client. */

export type Block = {
  number: bigint
  hash: `0x${string}`
  baseFeePerGas: bigint | null
}

export declare function getChainId(): Promise<number>
export declare function getBlock(options?: {
  blockNumber?: bigint
}): Promise<Block>
export declare function getBalance(options: {
  address: string
  blockNumber?: bigint
}): Promise<bigint>
export declare function getGasPrice(): Promise<bigint>
export declare function getCode(options: {
  address: string
}): Promise<string | undefined>
export declare function getTransactionCount(options: {
  address: string
}): Promise<number>
export declare function getTransactionReceipt(options: {
  hash: string
}): Promise<{ status: string } | null>
export declare function readContract(options: {
  address: string
  functionName: string
  args?: unknown[]
}): Promise<bigint>
export declare function sendTransaction(options: {
  to: string
  nonce?: number
}): Promise<`0x${string}`>
export declare function waitForTransactionReceipt(options: {
  hash: string
}): Promise<{ status: string }>
export declare function writeContract(options: {
  address: string
  functionName: string
}): Promise<`0x${string}`>
export declare function wait(ms: number): Promise<void>
export declare function assertChain(chainId: number): void
export declare const client: {
  request(options: { method: string; params?: unknown[] }): Promise<unknown>
}
