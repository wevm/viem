import { expect, test } from 'vitest'
import {
  walletClientWithAccount,
  accounts,
  testClient,
  walletClient,
} from '../../_test'
import { baycContractConfig } from '../../_test/abis'
import { parseEther } from '../../utils'
import { mine, setBalance } from '../test'

import { deployContract } from './deployContract'

test('default', async () => {
  const hash = await deployContract(walletClient, {
    ...baycContractConfig,
    args: ['Bored Ape Wagmi Club', 'BAYC', 69420n, 0n],
    account: accounts[0].address,
  })
  expect(hash).toBeDefined()

  await mine(testClient, { blocks: 1 })
})

test('inferred account', async () => {
  const hash = await deployContract(walletClientWithAccount, {
    ...baycContractConfig,
    args: ['Bored Ape Wagmi Club', 'BAYC', 69420n, 0n],
  })
  expect(hash).toBeDefined()

  await mine(testClient, { blocks: 1 })
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
      account: accounts[0].address,
    }),
  ).rejects.toThrowErrorMatchingSnapshot()

  await setBalance(testClient, {
    address: accounts[0].address,
    value: parseEther('10000'),
  })
})
