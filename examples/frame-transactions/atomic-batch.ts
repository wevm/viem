/**
 * Atomic Batch Frame Transaction
 *
 * Uses the ATOMIC_BATCH_FLAG (0x04) to link two SENDER frames so they
 * execute atomically: if either reverts, both revert.
 *
 *   Frame 0 (VERIFY):   Sender's validator approves.
 *   Frame 1 (SENDER):   ERC-20 `approve` -- grant the DEX router an allowance.
 *                        flags=0x04 (atomic) links this frame to the next.
 *   Frame 2 (SENDER):   DEX `swapExactTokensForTokens` -- swap tokens.
 *                        flags=0x00 (last frame in the atomic group).
 *
 * Without atomicity, a successful approve followed by a reverted swap
 * would leave a dangling allowance. The atomic batch flag guarantees
 * all-or-nothing execution at the protocol level.
 */

import {
  type Address,
  createClient,
  encodeFunctionData,
  type Hex,
  http,
  parseGwei,
  parseUnits,
  serializeTransaction,
  type TransactionSerializableEIP8141,
} from 'viem'

const RPC_URL = 'https://demo.eip-8141.ethrex.xyz/rpc'

// Demo addresses.
const sender: Address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const validator: Address = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
const usdcToken: Address = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const dexRouter: Address = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
const wethToken: Address = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'

const ATOMIC_BATCH_FLAG = 0x04

const validatorAbi = [
  {
    name: 'validate',
    type: 'function',
    inputs: [{ name: 'txHash', type: 'bytes32' }],
    outputs: [],
    stateMutability: 'view',
  },
] as const

const erc20Abi = [
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

const dexAbi = [
  {
    name: 'swapExactTokensForTokens',
    type: 'function',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
  },
] as const

const swapAmount = parseUnits('1000', 6) // 1000 USDC (6 decimals)
const minOut = parseUnits('0.3', 18) // minimum 0.3 WETH out
const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600) // 1 hour

const tx: TransactionSerializableEIP8141 = {
  type: 'eip8141',
  chainId: 7,
  nonce: 2,
  sender,
  maxPriorityFeePerGas: parseGwei('1'),
  maxFeePerGas: parseGwei('10'),
  maxFeePerBlobGas: 0n,
  blobVersionedHashes: [],
  frames: [
    // Frame 0 -- VERIFY: sender's validator authorises.
    {
      mode: 1,
      flags: 0x03,
      target: validator,
      gasLimit: 50_000n,
      data: encodeFunctionData({
        abi: validatorAbi,
        functionName: 'validate',
        args: [
          '0x0000000000000000000000000000000000000000000000000000000000000002',
        ],
      }),
    },

    // Frame 1 -- SENDER + ATOMIC: approve the DEX router to spend USDC.
    // The atomic batch flag (0x04) links this frame to the next one.
    // If the swap in frame 2 reverts, this approve is also rolled back.
    {
      mode: 2,
      flags: ATOMIC_BATCH_FLAG,
      target: usdcToken,
      gasLimit: 60_000n,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [dexRouter, swapAmount],
      }),
    },

    // Frame 2 -- SENDER: swap USDC -> WETH on the DEX.
    // flags=0x00: last frame in the atomic group, no further chaining.
    {
      mode: 2,
      flags: 0x00,
      target: dexRouter,
      gasLimit: 200_000n,
      data: encodeFunctionData({
        abi: dexAbi,
        functionName: 'swapExactTokensForTokens',
        args: [swapAmount, minOut, [usdcToken, wethToken], sender, deadline],
      }),
    },
  ],
}

async function main() {
  const serialized = serializeTransaction(tx)
  console.log(
    'Serialized atomic-batch EIP-8141 tx:',
    serialized.slice(0, 66),
    '...',
  )
  console.log('Type byte: 0x06 (EIP-8141)')
  console.log('Frames:', tx.frames.length)
  console.log('  [0] VERIFY          - validator approves')
  console.log('  [1] SENDER (atomic) - approve USDC for DEX router')
  console.log('  [2] SENDER          - swap USDC -> WETH')
  console.log()
  console.log(
    'Atomic guarantee: if the swap reverts, the approve is rolled back too.',
  )
  console.log()

  const client = createClient({ transport: http(RPC_URL) })

  console.log('Sending to', RPC_URL, '...')
  const hash = await client.request({
    method: 'eth_sendRawTransaction' as any,
    params: [serialized as Hex],
  })
  console.log('Transaction hash:', hash)
}

main().catch((err) => {
  console.log('Failed to send frame transaction.', err)
  process.exit(1)
})
