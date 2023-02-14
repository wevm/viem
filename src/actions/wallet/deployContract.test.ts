import { expect, test } from 'vitest'
import { accounts, publicClient, testClient, walletClient } from '../../_test'
import { baycContractConfig } from '../../_test/abis'
import { parseEther } from '../../utils'
import { mine, setBalance } from '../test'

import { deployContract } from './deployContract'
import { getTransactionReceipt } from '../public'

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

  // expect(
  //   await simulateContract(publicClient, {
  //     abi: baycContractConfig.abi,
  //     address: contractAddress!,
  //     functionName: 'symbol',
  //   }),
  // ).toBe('BAYC')
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
  ).rejects.toThrowErrorMatchingSnapshot()

  await setBalance(testClient, {
    address: accounts[0].address,
    value: parseEther('10000'),
  })
})
