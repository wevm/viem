import { expect, test } from 'vitest'
import { accounts, publicClient, testClient, walletClient } from '../../../test'
import { baycContractConfig } from '../../../test/abis'
import { parseEther } from '../../utils'
import { mine, setBalance } from '../test'
import { callContract } from './callContract'

import { deployContract } from './deployContract'
import { getTransactionReceipt } from './getTransactionReceipt'

test('default', async () => {
  const hash = await deployContract(walletClient, {
    ...baycContractConfig,
    args: ['Bored Ape Wagmi Club', 'BAYC', 69420n, 0n],
    from: accounts[0].address,
  })
  expect(hash).toBeDefined()

  await mine(testClient, { blocks: 1 })
  const { contractAddress } = await getTransactionReceipt(publicClient, {
    hash,
  })

  expect(
    await callContract(publicClient, {
      abi: baycContractConfig.abi,
      address: contractAddress!,
      functionName: 'symbol',
    }),
  ).toBe('BAYC')
})

test('no funds', async () => {
  await setBalance(testClient, {
    address: accounts[0].address,
    value: parseEther('0'),
  })

  await expect(() =>
    deployContract(walletClient, {
      ...baycContractConfig,
      args: ['Bored Ape Wagmi Club', 'BAYC', 69420n, 0n],
      from: accounts[0].address,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "Transaction creation failed.

    Details: Insufficient funds for gas * price + value
    Version: viem@1.0.2"
  `)

  await setBalance(testClient, {
    address: accounts[0].address,
    value: parseEther('10000'),
  })
})
