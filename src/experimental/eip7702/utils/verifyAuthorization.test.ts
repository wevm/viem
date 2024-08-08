import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'

import { wagmiContractConfig } from '../../../../test/src/abis.js'
import { experimental_signAuthorization } from '../../../accounts/utils/signAuthorization.js'
import { verifyAuthorization } from './verifyAuthorization.js'

test('default', async () => {
  const authorization = await experimental_signAuthorization({
    contractAddress: wagmiContractConfig.address,
    chainId: 1,
    nonce: 0,
    privateKey: accounts[0].privateKey,
  })
  expect(
    await verifyAuthorization({
      address: accounts[0].address,
      authorization,
    }),
  ).toBe(true)
})

test('args: signature', async () => {
  const authorization = {
    contractAddress: wagmiContractConfig.address,
    chainId: 1,
    nonce: 0,
  } as const
  const signature = await experimental_signAuthorization({
    ...authorization,
    privateKey: accounts[0].privateKey,
  })
  expect(
    await verifyAuthorization({
      address: accounts[0].address,
      authorization,
      signature,
    }),
  ).toBe(true)
})
