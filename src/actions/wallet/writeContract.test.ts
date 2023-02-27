import { expect, test } from 'vitest'
import { getAccount } from '../../utils'
import {
  accounts,
  publicClient,
  testClient,
  wagmiContractConfig,
  walletClient,
} from '../../_test'
import { simulateContract } from '../public'
import { mine } from '../test'

import { writeContract } from './writeContract'

test('default', async () => {
  expect(
    await writeContract(walletClient, {
      ...wagmiContractConfig,
      account: getAccount(accounts[0].address),
      functionName: 'mint',
    }),
  ).toBeDefined()
})

test('overloaded function', async () => {
  expect(
    await writeContract(walletClient, {
      ...wagmiContractConfig,
      account: getAccount(accounts[0].address),
      functionName: 'mint',
      args: [69420n],
    }),
  ).toBeDefined()
})

test('w/ simulateContract', async () => {
  const { request } = await simulateContract(publicClient, {
    ...wagmiContractConfig,
    account: getAccount(accounts[0].address),
    functionName: 'mint',
  })
  expect(await writeContract(walletClient, request)).toBeDefined()

  await mine(testClient, { blocks: 1 })

  expect(
    await simulateContract(publicClient, {
      ...wagmiContractConfig,
      account: getAccount(accounts[0].address),
      functionName: 'mint',
    }),
  ).toBeDefined()
})

test('w/ simulateContract (overloaded)', async () => {
  const { request } = await simulateContract(publicClient, {
    ...wagmiContractConfig,
    account: getAccount(accounts[0].address),
    functionName: 'mint',
    args: [69421n],
  })
  expect(await writeContract(walletClient, request)).toBeDefined()

  await mine(testClient, { blocks: 1 })

  await expect(() =>
    simulateContract(publicClient, {
      ...wagmiContractConfig,
      account: getAccount(accounts[0].address),
      functionName: 'mint',
      args: [69421n],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "The contract function \\"mint\\" reverted with the following reason:
    Token ID is taken

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  mint(uint256 tokenId)
      args:          (69421)
      sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

    Docs: https://viem.sh/docs/contract/simulateContract
    Version: viem@1.0.2"
  `)
})
