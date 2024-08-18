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

  expect({
    ...signedAuthorization,
    r: null,
    s: null,
    v: null,
    yParity: null,
  }).toMatchInlineSnapshot(
    `
    {
      "chainId": 1,
      "contractAddress": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "nonce": 0,
      "r": null,
      "s": null,
      "v": null,
      "yParity": null,
    }
  `,
  )
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

  expect(signature).toMatchInlineSnapshot(
    `"0x1b633d8fa4b6822d010b17bdec4bd305eb024d302588edf0618fd04b26d686fd2633183f08457bbb7355b26280a122c7e6f5e38d5a23ece2cccf3068b6dd06ca1b"`,
  )
  expect(
    await verifyAuthorization({
      address: accounts[0].address,
      authorization,
      signature,
    }),
  ).toBe(true)
})
