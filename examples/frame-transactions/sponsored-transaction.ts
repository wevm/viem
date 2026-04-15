/**
 * Sponsored (Paymaster) Frame Transaction
 *
 * Demonstrates how a third party can pay gas on behalf of the sender
 * using three frames:
 *
 *   Frame 0 (VERIFY):   The sender's validator approves the transaction.
 *   Frame 1 (SENDER):   The sender's intended action (a contract call).
 *   Frame 2 (DEFAULT):  Runs as the entry point (0xaa), executing paymaster
 *                        logic that deducts fees from the sponsor rather
 *                        than the sender's balance.
 *
 * The DEFAULT frame is the key: it executes at the protocol entry point
 * address, which has special authority to manage gas payment on behalf
 * of an external sponsor.
 */

import {
  type Address,
  createClient,
  encodeFunctionData,
  type Hex,
  http,
  parseGwei,
  serializeTransaction,
  type TransactionSerializableEIP8141,
} from 'viem'

const RPC_URL = 'https://demo.eip-8141.ethrex.xyz/rpc'

// Demo addresses.
const sender: Address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const validator: Address = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
const paymaster: Address = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
const targetContract: Address = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

const validatorAbi = [
  {
    name: 'validate',
    type: 'function',
    inputs: [{ name: 'txHash', type: 'bytes32' }],
    outputs: [],
    stateMutability: 'view',
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

// The paymaster contract's `sponsorGas` method is invoked in the DEFAULT
// frame. This runs at the entry point address and arranges for the
// sponsor to cover all gas costs.
const paymasterAbi = [
  {
    name: 'sponsorGas',
    type: 'function',
    inputs: [
      { name: 'sponsor', type: 'address' },
      { name: 'sender', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

const tx: TransactionSerializableEIP8141 = {
  type: 'eip8141',
  chainId: 7,
  nonce: 1,
  sender,
  maxPriorityFeePerGas: parseGwei('1'),
  maxFeePerGas: parseGwei('10'),
  maxFeePerBlobGas: 0n,
  blobVersionedHashes: [],
  frames: [
    // Frame 0 -- VERIFY: sender's validator authorises.
    // flags=0x03 means approval scope covers all subsequent frames.
    {
      mode: 1,
      flags: 0x03,
      target: validator,
      gasLimit: 50_000n,
      data: encodeFunctionData({
        abi: validatorAbi,
        functionName: 'validate',
        args: [
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        ],
      }),
    },

    // Frame 1 -- SENDER: the user's actual intent, runs as tx.sender.
    {
      mode: 2,
      flags: 0x00,
      target: targetContract,
      gasLimit: 100_000n,
      data: encodeFunctionData({
        abi: storageAbi,
        functionName: 'store',
        args: [42n],
      }),
    },

    // Frame 2 -- DEFAULT: paymaster logic at the entry point.
    // Executes as address 0xaa, calling the paymaster contract to
    // debit the sponsor's pre-funded balance instead of the sender's.
    {
      mode: 0,
      flags: 0x00,
      target: paymaster,
      gasLimit: 80_000n,
      data: encodeFunctionData({
        abi: paymasterAbi,
        functionName: 'sponsorGas',
        args: [paymaster, sender],
      }),
    },
  ],
}

async function main() {
  const serialized = serializeTransaction(tx)
  console.log(
    'Serialized sponsored EIP-8141 tx:',
    serialized.slice(0, 66),
    '...',
  )
  console.log('Type byte: 0x06 (EIP-8141)')
  console.log('Frames:', tx.frames.length)
  console.log('  [0] VERIFY   - validator approves')
  console.log('  [1] SENDER   - store(42) on target contract')
  console.log('  [2] DEFAULT  - paymaster sponsors gas')
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
