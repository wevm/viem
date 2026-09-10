import { expect, test } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { toAccount } from '../accounts/toAccount.js'
import { key } from '../keys.js'
import { erc1167Bytecode } from '../utils/proxy.js'
import { eip8130Actions } from './eip8130Actions.js'

const owner = privateKeyToAccount(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const account = toAccount({
  signer: owner,
  userSalt: `0x${'01'.padStart(64, '0')}`,
  code: erc1167Bytecode('0x00000000000000000000000000000000000000Ec'),
  initialActors: [key.k1(owner.address)],
})

function makeClient() {
  return createClient({
    chain: mainnet,
    transport: custom({
      async request({ method }: { method: string }) {
        if (method === 'eth_chainId') return '0x1'
        if (method === 'eth_call') return `0x${'0'.repeat(192)}`
        if (method === 'eth_getTransactionCount') return '0x0'
        throw new Error(`unexpected chain RPC: ${method}`)
      },
    }),
  }).extend(eip8130Actions())
}

test('exposes actions under the eip8130 namespace', () => {
  const client = makeClient()
  expect(typeof client.eip8130.sendTransaction).toBe('function')
  expect(typeof client.eip8130.prepareTransactionRequest).toBe('function')
  expect(typeof client.eip8130.getConfigSequence).toBe('function')
})

test('client.eip8130.prepareTransactionRequest fills the transaction', async () => {
  const client = makeClient()
  const request = await client.eip8130.prepareTransactionRequest({
    account,
    calls: [[{ to: account.address, data: '0x' }]],
    gas: 200_000n,
    maxFeePerGas: 1_000_000_000n,
    maxPriorityFeePerGas: 1_000_000n,
    nonceSequence: 0n,
  })
  expect(request.from).toBe(account.address)
  expect(request.gas).toBe(200_000n)
  expect(request.chainId).toBe(1)
})
