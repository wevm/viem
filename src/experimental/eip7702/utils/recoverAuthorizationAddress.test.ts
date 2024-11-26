import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'

import { wagmiContractConfig } from '../../../../test/src/abis.js'
import { experimental_signAuthorization } from '../../../accounts/utils/signAuthorization.js'
import { getAddress } from '../../../utils/address/getAddress.js'
import { recoverAuthorizationAddress } from './recoverAuthorizationAddress.js'

test('default', async () => {
  const signedAuthorization = await experimental_signAuthorization({
    contractAddress: wagmiContractConfig.address,
    chainId: 1,
    nonce: 0,
    privateKey: accounts[0].privateKey,
  })
  expect(
    await recoverAuthorizationAddress({
      authorization: signedAuthorization,
    }),
  ).toBe(getAddress(accounts[0].address))
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
    await recoverAuthorizationAddress({
      authorization,
      signature,
    }),
  ).toBe(getAddress(accounts[0].address))
})

test('args: signature (hex)', async () => {
  const authorization = {
    contractAddress: wagmiContractConfig.address,
    chainId: 1,
    nonce: 0,
  } as const
  const signature = await experimental_signAuthorization({
    ...authorization,
    privateKey: accounts[0].privateKey,
    to: 'hex',
  })
  expect(
    await recoverAuthorizationAddress({
      authorization,
      signature,
    }),
  ).toBe(getAddress(accounts[0].address))
})
