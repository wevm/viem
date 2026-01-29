import { expect, test } from 'vitest'

import { baycContractConfig, payableContractConfig } from '~test/src/abis.js'
import { accounts } from '~test/src/constants.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { getBalance } from '../public/getBalance.js'
import { mine } from '../test/mine.js'
import { setBalance } from '../test/setBalance.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { getTransactionReceipt } from '../public/getTransactionReceipt.js'
import { deployContract } from './deployContract.js'
import { signAuthorization } from './signAuthorization.js'

const client = anvilMainnet.getClient()
const clientWithAccount = anvilMainnet.getClient({
  account: accounts[0].address,
})

test('default', async () => {
  const hash = await deployContract(client, {
    ...baycContractConfig,
    args: ['Bored Ape Wagmi Club', 'BAYC', 69420n, 0n],
    account: accounts[0].address,
  })
  expect(hash).toBeDefined()

  await mine(client, { blocks: 1 })
})

test('inferred account', async () => {
  const hash = await deployContract(clientWithAccount, {
    ...baycContractConfig,
    args: ['Bored Ape Wagmi Club', 'BAYC', 69420n, 0n],
  })
  expect(hash).toBeDefined()

  await mine(client, { blocks: 1 })
})

test('no funds', async () => {
  await setBalance(client, {
    address: accounts[0].address,
    value: parseEther('0'),
  })

  await expect(() =>
    deployContract(client, {
      ...baycContractConfig,
      args: ['Bored Ape Wagmi Club', 'BAYC', 69420n, 0n],
      account: accounts[0].address,
    }),
  ).rejects.toThrowErrorMatchingSnapshot()

  await setBalance(client, {
    address: accounts[0].address,
    value: parseEther('10000'),
  })
})

test('send value to contract', async () => {
  await setBalance(client, {
    address: accounts[0].address,
    value: parseEther('2'),
  })

  const hash = await deployContract(client, {
    ...payableContractConfig,
    account: accounts[0].address,
    value: parseEther('1'),
  })
  expect(hash).toBeDefined()

  await mine(client, { blocks: 1 })

  expect(
    await getBalance(client, { address: accounts[0].address }),
  ).toBeLessThan(parseEther('1'))
})

test('with authorizationList', async () => {
  // Create an authorization
  const authorization = await signAuthorization(client, {
    account: privateKeyToAccount(accounts[1].privateKey),
    contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  })

  // Deploy a contract with authorizationList
  const hash = await deployContract(client, {
    ...baycContractConfig,
    account: accounts[0].address,
    args: ['Bored Ape Wagmi Club', 'BAYC', 69420n, 0n],
    authorizationList: [authorization],
  })
  expect(hash).toBeDefined()

  await mine(client, { blocks: 1 })

  // Verify the transaction was a contract deployment (to address should be null)
  const receipt = await getTransactionReceipt(client, { hash })
  expect(receipt.to).toBeNull()
  expect(receipt.contractAddress).toBeDefined()
})
