/**
 * Simple Self-Verified Frame Transaction
 *
 * The most basic EIP-8141 pattern: two frames.
 *
 *   Frame 0 (VERIFY):  The sender's validator contract runs read-only
 *                       validation and calls APPROVE to authorise the tx.
 *   Frame 1 (SENDER):  Executes a plain ETH transfer as the sender.
 *
 * No third-party payer, no batching -- just native account abstraction.
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

// Demo addresses -- replace with your own for a real network.
const sender: Address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const validator: Address = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
const recipient: Address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

// Minimal validator ABI -- the VERIFY frame calls `validate` on the
// sender's validator contract.  The contract is expected to inspect
// the transaction context and call the APPROVE opcode if it is valid.
const validatorAbi = [
  {
    name: 'validate',
    type: 'function',
    inputs: [{ name: 'txHash', type: 'bytes32' }],
    outputs: [],
    stateMutability: 'view',
  },
] as const

const tx: TransactionSerializableEIP8141 = {
  type: 'eip8141',
  chainId: 7,
  nonce: 0,
  sender,
  maxPriorityFeePerGas: parseGwei('1'),
  maxFeePerGas: parseGwei('10'),
  maxFeePerBlobGas: 0n,
  blobVersionedHashes: [],
  frames: [
    // Frame 0 -- VERIFY: read-only validation by the sender's validator.
    // flags=0x01 means approval scope covers the immediate next frame.
    {
      mode: 1,
      flags: 0x01,
      target: validator,
      gasLimit: 50_000n,
      data: encodeFunctionData({
        abi: validatorAbi,
        functionName: 'validate',
        args: [
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        ],
      }),
    },

    // Frame 1 -- SENDER: execute as the sender (transfer ETH to recipient).
    // An empty `data` field with a target is a plain value transfer.
    {
      mode: 2,
      flags: 0x00,
      target: recipient,
      gasLimit: 21_000n,
      data: '0x',
    },
  ],
}

async function main() {
  const serialized = serializeTransaction(tx)
  console.log('Serialized EIP-8141 tx:', serialized.slice(0, 66), '...')
  console.log('Type byte: 0x06 (EIP-8141)')
  console.log('Frames:', tx.frames.length)
  console.log()

  const client = createClient({ transport: http(RPC_URL) })

  console.log('Sending to', RPC_URL, '...')
  const hash = await client.request({
    method: 'eth_sendRawTransaction' as any,
    params: [serialized as Hex],
  })
  console.log('Transaction hash:', hash)
}

main().catch((_err) => {
  process.exit(1)
})
