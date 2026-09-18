/**
 * Atomic Batch Frame Transaction (EIP-8141 Example 2)
 *
 * Uses the ATOMIC_BATCH_FLAG (0x04) to link two SENDER frames so they
 * execute atomically: if either reverts, both revert.
 *
 *   Frame 0 (VERIFY):   Default code checks the sender's signature and
 *                        calls APPROVE(EXECUTION_AND_PAYMENT).
 *   Frame 1 (SENDER):   ERC-20 `approve` -- grant the DEX router an allowance.
 *                        flags=0x04 (atomic) links this frame to the next.
 *   Frame 2 (SENDER):   DEX `swapExactTokensForTokens` -- swap tokens.
 *                        flags=0x00 (last frame in the atomic group).
 *
 * Without atomicity, a successful approve followed by a reverted swap
 * would leave a dangling allowance. The atomic batch flag guarantees
 * all-or-nothing execution at the protocol level. Frames inside a batch
 * may not carry an APPROVE scope.
 */

import {
  type Address,
  createClient,
  encodeFunctionData,
  type Hex,
  http,
  parseGwei,
  parseUnits,
  type TransactionSerializableEIP8141,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sendRawTransaction } from 'viem/actions'

const RPC_URL = 'https://rpc1.eip-8141.ethrex.xyz'
const CHAIN_ID = 3151908

// Demo key and addresses -- replace with your own for a real network.
const PRIVATE_KEY = (process.env.PRIVATE_KEY ??
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80') as Hex

const account = privateKeyToAccount(PRIVATE_KEY)
const usdcToken: Address = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const dexRouter: Address = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
const wethToken: Address = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'

const VERIFY = 1
const SENDER = 2
const APPROVE_EXECUTION_AND_PAYMENT = 0x03
const ATOMIC_BATCH_FLAG = 0x04

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
  chainId: CHAIN_ID,
  nonce: 2,
  sender: account.address,
  maxPriorityFeePerGas: parseGwei('1'),
  maxFeePerGas: parseGwei('10'),
  frames: [
    // Frame 0 -- VERIFY: default code checks `signatures[0]` and approves.
    {
      mode: VERIFY,
      flags: APPROVE_EXECUTION_AND_PAYMENT,
      target: null,
      limits: { execution: 30_000n, state: 0n },
      value: 0n,
      data: '0x',
    },

    // Frame 1 -- SENDER + ATOMIC: approve the DEX router to spend USDC.
    // The atomic batch flag (0x04) links this frame to the next one.
    // If the swap in frame 2 reverts, this approve is also rolled back.
    {
      mode: SENDER,
      flags: ATOMIC_BATCH_FLAG,
      target: usdcToken,
      limits: { execution: 60_000n, state: 25_000n },
      value: 0n,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [dexRouter, swapAmount],
      }),
    },

    // Frame 2 -- SENDER: swap USDC -> WETH on the DEX.
    // flags=0x00: last frame in the atomic group, no further chaining.
    {
      mode: SENDER,
      flags: 0,
      target: dexRouter,
      limits: { execution: 200_000n, state: 50_000n },
      value: 0n,
      data: encodeFunctionData({
        abi: dexAbi,
        functionName: 'swapExactTokensForTokens',
        args: [
          swapAmount,
          minOut,
          [usdcToken, wethToken],
          account.address,
          deadline,
        ],
      }),
    },
  ],
}

async function main() {
  const serialized = await account.signTransaction(tx)
  console.log(
    'Serialized atomic-batch EIP-8141 tx:',
    serialized.slice(0, 66),
    '...',
  )
  console.log('Type byte: 0x06 (EIP-8141)')
  console.log('Frames:', tx.frames.length)
  console.log('  [0] VERIFY          - default code approves')
  console.log('  [1] SENDER (atomic) - approve USDC for DEX router')
  console.log('  [2] SENDER          - swap USDC -> WETH')
  console.log()
  console.log(
    'Atomic guarantee: if the swap reverts, the approve is rolled back too.',
  )
  console.log()

  const client = createClient({ transport: http(RPC_URL) })

  console.log('Sending to', RPC_URL, `(chainId ${CHAIN_ID}) ...`)
  const hash = await sendRawTransaction(client, {
    serializedTransaction: serialized,
  })
  console.log('Transaction hash:', hash)
}

main().catch((err) => {
  console.log('Failed to send frame transaction.', err)
  process.exit(1)
})
