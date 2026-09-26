/**
 * Sponsored (Paymaster) Frame Transaction (EIP-8141 Example 3)
 *
 * Demonstrates how a third party can pay gas on behalf of the sender:
 *
 *   Frame 0 (VERIFY):   Default code checks the sender's signature and calls
 *                        APPROVE(EXECUTION) -- execution only, no payment.
 *   Frame 1 (VERIFY):   The sponsor's paymaster contract validates the
 *                        request (it may inspect `tx.signatures` via SIGPARAM
 *                        and the next frame via FRAMEPARAM) and calls
 *                        APPROVE(PAYMENT). The sponsor becomes the `payer`.
 *   Frame 2 (SENDER):   The sender pays the sponsor in ERC-20 tokens.
 *   Frame 3 (SENDER):   The sender's intended action (a contract call).
 *   Frame 4 (DEFAULT):  Optional post-op run as the entry point (0xaa), e.g.
 *                        refunding unused fees.
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
const paymaster: Address = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
const feeToken: Address = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const targetContract: Address = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'

const DEFAULT = 0
const VERIFY = 1
const SENDER = 2
const APPROVE_PAYMENT = 0x01
const APPROVE_EXECUTION = 0x02

const erc20Abi = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

// The sender wants to call `store(uint256)` on a target contract.
const storageAbi = [
  {
    name: 'store',
    type: 'function',
    inputs: [{ name: 'value', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

// The paymaster's VERIFY entry point checks that frame 2 pays it enough
// tokens for the transaction's `max_cost`, then calls APPROVE(PAYMENT).
// Its DEFAULT post-op refunds the unused portion.
const paymasterAbi = [
  {
    name: 'validate',
    type: 'function',
    inputs: [{ name: 'maxTokenFee', type: 'uint256' }],
    outputs: [],
    stateMutability: 'view',
  },
  {
    name: 'postOp',
    type: 'function',
    inputs: [{ name: 'sender', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

const maxTokenFee = parseUnits('5', 6) // up to 5 USDC for gas

const tx: TransactionSerializableEIP8141 = {
  type: 'eip8141',
  chainId: CHAIN_ID,
  nonce: 1,
  sender: account.address,
  maxPriorityFeePerGas: parseGwei('1'),
  maxFeePerGas: parseGwei('10'),
  frames: [
    // Frame 0 -- VERIFY: default code checks `signatures[0]` and approves
    // execution only. Payment is left to the sponsor.
    {
      mode: VERIFY,
      flags: APPROVE_EXECUTION,
      target: null,
      limits: { execution: 30_000n, state: 0n },
      value: 0n,
      data: '0x',
    },

    // Frame 1 -- VERIFY: paymaster validates and approves payment.
    {
      mode: VERIFY,
      flags: APPROVE_PAYMENT,
      target: paymaster,
      limits: { execution: 50_000n, state: 0n },
      value: 0n,
      data: encodeFunctionData({
        abi: paymasterAbi,
        functionName: 'validate',
        args: [maxTokenFee],
      }),
    },

    // Frame 2 -- SENDER: pay the sponsor in tokens.
    {
      mode: SENDER,
      flags: 0,
      target: feeToken,
      limits: { execution: 60_000n, state: 25_000n },
      value: 0n,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [paymaster, maxTokenFee],
      }),
    },

    // Frame 3 -- SENDER: the user's actual intent, runs as tx.sender.
    {
      mode: SENDER,
      flags: 0,
      target: targetContract,
      limits: { execution: 100_000n, state: 25_000n },
      value: 0n,
      data: encodeFunctionData({
        abi: storageAbi,
        functionName: 'store',
        args: [42n],
      }),
    },

    // Frame 4 -- DEFAULT: paymaster post-op at the entry point (0xaa).
    {
      mode: DEFAULT,
      flags: 0,
      target: paymaster,
      limits: { execution: 80_000n, state: 25_000n },
      value: 0n,
      data: encodeFunctionData({
        abi: paymasterAbi,
        functionName: 'postOp',
        args: [account.address],
      }),
    },
  ],
}

async function main() {
  const serialized = await account.signTransaction(tx)
  console.log(
    'Serialized sponsored EIP-8141 tx:',
    serialized.slice(0, 66),
    '...',
  )
  console.log('Type byte: 0x06 (EIP-8141)')
  console.log('Frames:', tx.frames.length)
  console.log('  [0] VERIFY   - default code approves execution')
  console.log('  [1] VERIFY   - paymaster approves payment')
  console.log('  [2] SENDER   - pay the paymaster in tokens')
  console.log('  [3] SENDER   - store(42) on target contract')
  console.log('  [4] DEFAULT  - paymaster post-op')
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
