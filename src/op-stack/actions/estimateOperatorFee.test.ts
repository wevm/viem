import { expect, test } from 'vitest'
import { anvilOptimism } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { parseGwei, type TransactionRequestEIP1559 } from '../../index.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import { toFunctionSelector } from '../../utils/hash/toFunctionSelector.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { estimateOperatorFee } from './estimateOperatorFee.js'

const optimismClient = anvilOptimism.getClient()
const optimismClientWithAccount = anvilOptimism.getClient({ account: true })
const optimismClientWithoutChain = anvilOptimism.getClient({ chain: false })

const baseTransaction = {
  maxFeePerGas: parseGwei('100'),
  maxPriorityFeePerGas: parseGwei('1'),
  to: accounts[1].address,
  value: parseEther('0.1'),
} as const satisfies Omit<TransactionRequestEIP1559, 'from'>

test('default', async () => {
  const fee = await estimateOperatorFee(
    optimismClientWithAccount,
    baseTransaction,
  )
  expect(fee).toBeDefined()
})

test('minimal', async () => {
  const fee = await estimateOperatorFee(optimismClientWithAccount, {})
  expect(fee).toBeDefined()
})

test('args: account', async () => {
  const fee = await estimateOperatorFee(optimismClient, {
    ...baseTransaction,
    account: accounts[0].address,
  })
  expect(fee).toBeDefined()
})

test('args: data', async () => {
  const fee = await estimateOperatorFee(optimismClientWithAccount, {
    ...baseTransaction,
    data: '0x00000000000000000000000000000000000000000000000004fefa17b7240000',
  })
  expect(fee).toBeDefined()
})

test('args: gasPriceOracleAddress', async () => {
  const fee = await estimateOperatorFee(optimismClientWithAccount, {
    ...baseTransaction,
    gasPriceOracleAddress: '0x420000000000000000000000000000000000000F',
  })
  expect(fee).toBeDefined()
})

test('args: l1BlockAddress', async () => {
  const [fee, expected] = await Promise.all([
    estimateOperatorFee(optimismClientWithAccount, {
      ...baseTransaction,
      l1BlockAddress: '0x4200000000000000000000000000000000000015',
    }),
    estimateOperatorFee(optimismClientWithAccount, baseTransaction),
  ])
  expect(fee).toBe(expected)
})

test('behavior: l1BlockAddress is used', async () => {
  await expect(
    estimateOperatorFee(optimismClientWithAccount, {
      ...baseTransaction,
      l1BlockAddress: accounts[1].address,
    }),
  ).rejects.toThrow()
})

test('behavior: Jovian l1BlockAddress formula', async () => {
  const client = createClient({
    transport: custom({
      async request({ method, params }) {
        if (method === 'eth_estimateGas') return numberToHex(100n)
        if (method === 'eth_call') {
          const data = params[0].data
          if (data === toFunctionSelector('operatorFeeScalar()'))
            return numberToHex(2n, { size: 32 })
          if (data === toFunctionSelector('operatorFeeConstant()'))
            return numberToHex(3n, { size: 32 })
          if (data === toFunctionSelector('isJovian()'))
            return numberToHex(1n, { size: 32 })
        }
        throw new Error(`Unexpected request: ${method}`)
      },
    }),
  })

  const fee = await estimateOperatorFee(client, {
    account: accounts[0].address,
    chain: null,
    l1BlockAddress: '0x4200000000000000000000000000000000000015',
    to: accounts[1].address,
  })
  expect(fee).toBe(20_003n)
})

test('args: nonce', async () => {
  const fee = await estimateOperatorFee(optimismClientWithAccount, {
    ...baseTransaction,
    nonce: 69,
  })
  expect(fee).toBeDefined()
})

test('args: nullish chain', async () => {
  const fee = await estimateOperatorFee(optimismClientWithoutChain, {
    ...baseTransaction,
    account: accounts[0].address,
    chain: null,
  })
  expect(fee).toBeDefined()
})
