import { expect, test } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { toAccount } from '../../eip8130/accounts/toAccount.js'
import { key } from '../../eip8130/keys.js'
import { erc1167Bytecode } from '../../eip8130/utils/proxy.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import { createPayerClient } from '../client.js'
import type { GetTermsReturnType } from '../types.js'
import { eip8168Actions } from './eip8168Actions.js'

const owner = privateKeyToAccount(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const account = toAccount({
  signer: owner,
  userSalt: `0x${'01'.padStart(64, '0')}`,
  code: erc1167Bytecode('0x00000000000000000000000000000000000000Ec'),
  initialActors: [key.k1(owner.address)],
})
const PAYER = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' as const
const userCalls = [
  {
    to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
    data: '0x' as const,
  },
]
const gasEstimate = {
  gasLimit: '0xC350',
  maxFeePerGas: '0x59682F00',
  maxPriorityFeePerGas: '0x59682F00',
} as const
const sponsoredTerms: GetTermsReturnType = {
  gasEstimate,
  options: [{ kind: 'sponsored', payer: PAYER, ttl: 300 }],
}

function makeChain() {
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
  })
}

test('binds a default payerClient and exposes client.payer.*', async () => {
  const payerClient = createPayerClient({
    transport: custom({
      async request({ method, params }: { method: string; params: any }) {
        if (method === 'payer_getTerms') return sponsoredTerms
        if (method === 'payer_sendTransaction')
          return { transactionHash: keccak256(params[0].signedTransaction) }
        throw new Error(`unexpected ${method}`)
      },
    }),
  })
  const client = makeChain().extend(eip8168Actions({ payerClient }))

  const { capabilities } = await client.payer.prepareTransactionRequest({
    account,
    calls: userCalls,
    capabilities: { paymasterService: {} },
    nonceSequence: 0n,
  })
  expect(capabilities.paymentOptions[0].kind).toBe('sponsored')

  const result = await client.payer.sendTransaction({
    account,
    calls: userCalls,
    capabilities: {
      paymentOption: capabilities.paymentOptions[0],
      gasEstimate,
    },
    nonceSequence: 0n,
  })
  expect(result).toHaveProperty('transactionHash')
})

test('throws when no payerClient is bound or provided', () => {
  const client = makeChain().extend(eip8168Actions())
  expect(() =>
    client.payer.sendTransaction({
      account,
      calls: userCalls,
      capabilities: { paymentOption: sponsoredTerms.options[0], gasEstimate },
      nonceSequence: 0n,
    } as never),
  ).toThrow('`payerClient` is required')
})
