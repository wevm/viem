import { expect, test } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { mine } from '../test/mine.js'
import { sendTransaction } from '../wallet/sendTransaction.js'
import { getRawTransaction } from './getRawTransaction.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  const rawTransaction = await getRawTransaction(client, {
    hash: '0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b',
  })
  expect(keccak256(rawTransaction)).toBe(
    '0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b',
  )
  expect(rawTransaction).toMatchInlineSnapshot(
    `"0x02f8d4018307d45c843b9aca0085070e98ce83830186a09415d4c048f83bd7e37d49ea4c83a07267ec4203da80b86423b872dd000000000000000000000000a00f99bc38b1ecda1fd70eaa1cd31d576a9f46b0000000000000000000000000f16e9b0d03470827a95cdfd0cb8a8a3b46969b910000000000000000000000000000000000000000000000000000002b3b6fb3d0c001a05e49a7bd0534c6b6d3bbe581659424d3747f920d40ce56e48d26e5d94aac32caa01746abe27b7c4f00bda1ec714ac1f7083e9025b6ca3b2248e439a173e4ab55e0"`,
  )
})

test('behavior: pending transaction', async () => {
  const hash = await sendTransaction(client, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })

  const rawTransaction = await getRawTransaction(client, { hash })
  expect(keccak256(rawTransaction)).toBe(hash)

  await mine(client, { blocks: 1 })

  const rawTransaction_mined = await getRawTransaction(client, { hash })
  expect(keccak256(rawTransaction_mined)).toBe(hash)
})

test('error: transaction not found', async () => {
  await expect(() =>
    getRawTransaction(client, {
      hash: '0x0000000000000000000000000000000000000000000000000000000000000001',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [TransactionNotFoundError: Transaction with hash "0x0000000000000000000000000000000000000000000000000000000000000001" could not be found.

    Version: viem@x.y.z]
  `)
})
