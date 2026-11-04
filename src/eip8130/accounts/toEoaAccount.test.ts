import { expect, test } from 'vitest'
import { accounts } from '~test/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { sliceHex } from '../../utils/data/slice.js'
import { prepareTransactionRequest } from '../actions/sendTransaction.js'
import { k1Authenticator } from '../constants.js'
import { parseTransaction } from '../utils/parseTransaction.js'
import { toEoaAccount } from './toEoaAccount.js'

const owner = privateKeyToAccount(accounts[0].privateKey)
const bob = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as const
const implementation = '0x00000000000000000000000000000000000000Ec' as const

const client = createClient({
  chain: mainnet,
  transport: custom({
    async request({ method }: { method: string }) {
      if (method === 'eth_chainId') return '0x1'
      if (method === 'eth_call') return `0x${'0'.repeat(64)}`
      if (method === 'eth_getTransactionCount') return '0x0'
      throw new Error(`unexpected RPC: ${method}`)
    },
  }),
})

test('default', () => {
  const account = toEoaAccount(owner)
  expect(account.address).toBe(owner.address)
  expect(account.type).toBe('local')
  expect(account.source).toBe('eip8130')
  expect(account.actorId).toBeUndefined()
  expect(account.resolveNonceKey).toBeUndefined()
})

test('delegate: builds an explicit delegation entry', () => {
  expect(toEoaAccount(owner).delegate(implementation)).toEqual({
    type: 'delegation',
    target: implementation,
  })
})

test('behavior: prepares and signs value calls with delegation', async () => {
  const account = toEoaAccount(owner)
  const transaction = await prepareTransactionRequest(client, {
    account,
    accountChanges: [account.delegate(implementation)],
    calls: [[{ to: bob, value: 1_000n }]],
    gas: 100_000n,
    maxFeePerGas: 2n,
    maxPriorityFeePerGas: 1n,
  })
  expect(transaction.calls).toEqual([[{ to: bob, value: 1_000n }]])

  const parsed = parseTransaction(await account.signTransaction(transaction))
  expect(parsed.from?.toLowerCase()).toBe(owner.address.toLowerCase())
  expect(parsed.accountChanges).toEqual([
    { type: 'delegation', target: implementation.toLowerCase() },
  ])
  expect(parsed.calls?.[0]?.[0]?.value).toBe(1_000n)
  expect(sliceHex(parsed.senderAuth!, 0, 20)).toBe(k1Authenticator)
})

test('behavior: throws without an address', () => {
  expect(() => toEoaAccount({} as never)).toThrow('`signer.address`')
})
