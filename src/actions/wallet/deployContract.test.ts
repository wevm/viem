import { expect, test } from 'vitest'

import { baycContractConfig, payableContractConfig } from '~test/src/abis.js'
import { accounts } from '~test/src/constants.js'
import {
  testClient,
  walletClient,
  walletClientWithAccount,
} from '~test/src/utils.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { getBalance } from '../public/getBalance.js'
import { mine } from '../test/mine.js'
import { setBalance } from '../test/setBalance.js'

import { deployContract } from './deployContract.js'

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

test('send value to contract', async () => {
  await setBalance(testClient, {
    address: accounts[0].address,
    value: parseEther('2'),
  })

  const hash = await deployContract(walletClient, {
    ...payableContractConfig,
    account: accounts[0].address,
    value: parseEther('1'),
  })
  expect(hash).toBeDefined()

  await mine(testClient, { blocks: 1 })

  expect(
    await getBalance(testClient, { address: accounts[0].address }),
  ).toBeLessThan(parseEther('1'))
})
