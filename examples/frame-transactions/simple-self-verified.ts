/**
 * Simple Self-Verified Frame Transaction (EIP-8141 Example 1a)
 *
 * The most basic EIP-8141 pattern: two frames and one signature.
 *
 *   Frame 0 (VERIFY):  Targets `null` (the sender). An account without code
 *                       runs the protocol's default code, which checks the
 *                       sender's SECP256K1 signature in `tx.signatures` and
 *                       calls APPROVE(EXECUTION_AND_PAYMENT).
 *   Frame 1 (SENDER):  Executes a plain ETH transfer as the sender.
 *
 * `signTransaction` signs the canonical signature hash and places the
 * signature (`v || r || s`) into the outer `signatures` list.
 */

import {
  type Address,
  createClient,
  type Hex,
  http,
  parseEther,
  parseGwei,
  type TransactionSerializableEIP8141,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sendRawTransaction } from 'viem/actions'

const RPC_URL = 'https://rpc1.eip-8141.ethrex.xyz'
const CHAIN_ID = 3151908

// Demo key -- replace with your own for a real network.
const PRIVATE_KEY = (process.env.PRIVATE_KEY ??
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80') as Hex

const account = privateKeyToAccount(PRIVATE_KEY)
const recipient: Address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

const VERIFY = 1
const SENDER = 2
const APPROVE_EXECUTION_AND_PAYMENT = 0x03

const tx: TransactionSerializableEIP8141 = {
  type: 'eip8141',
  chainId: CHAIN_ID,
  nonce: 0,
  sender: account.address,
  maxPriorityFeePerGas: parseGwei('1'),
  maxFeePerGas: parseGwei('10'),
  frames: [
    // Frame 0 -- VERIFY: default code checks `signatures[0]` and approves
    // both execution and payment for the sender.
    {
      mode: VERIFY,
      flags: APPROVE_EXECUTION_AND_PAYMENT,
      target: null,
      limits: { execution: 30_000n, state: 0n },
      value: 0n,
      data: '0x',
    },

    // Frame 1 -- SENDER: transfer ETH to recipient.
    {
      mode: SENDER,
      flags: 0,
      target: recipient,
      limits: { execution: 21_000n, state: 0n },
      value: parseEther('0.001'),
      data: '0x',
    },
  ],
}

async function main() {
  // `signTransaction` appends the sender's SECP256K1 signature to `signatures`.
  const serialized = await account.signTransaction(tx)
  console.log('Serialized EIP-8141 tx:', serialized.slice(0, 66), '...')
  console.log('Type byte: 0x06 (EIP-8141)')
  console.log('Frames:', tx.frames.length)
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
