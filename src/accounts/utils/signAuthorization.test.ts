import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'

import { wagmiContractConfig } from '../../../test/src/abis.js'
import { verifyAuthorization } from '../../experimental/eip7702/utils/verifyAuthorization.js'
import { experimental_signAuthorization } from './signAuthorization.js'

test('default', async () => {
  const signedAuthorization = await experimental_signAuthorization({
    contractAddress: wagmiContractConfig.address,
    chainId: 1,
    nonce: 0,
    privateKey: accounts[0].privateKey,
  })

  expect(signedAuthorization.r).toBeDefined()
  expect(signedAuthorization.s).toBeDefined()
  expect(signedAuthorization.v).toBeDefined()
  expect(signedAuthorization.yParity).toBeDefined()
  expect(
    await verifyAuthorization({
      address: accounts[0].address,
      authorization: signedAuthorization,
    }),
  ).toBe(true)
})

test('args: to (hex)', async () => {
  const authorization = {
    contractAddress: wagmiContractConfig.address,
    chainId: 1,
    nonce: 0,
  }
  const signature = await experimental_signAuthorization({
    ...authorization,
    privateKey: accounts[0].privateKey,
    to: 'hex',
  })

  expect(
    await verifyAuthorization({
      address: accounts[0].address,
      authorization,
      signature,
    }),
  ).toBe(true)
})
