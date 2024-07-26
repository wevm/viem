import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'

import { wagmiContractConfig } from '../../../test/src/abis.js'
import { verifyAuthorization } from '../../utils/signature/verifyAuthorization.js'
import { signAuthorization } from './signAuthorization.js'

test('default', async () => {
  const authorization = {
    address: wagmiContractConfig.address,
    chainId: 1,
    nonce: 0,
  }
  const signature = await signAuthorization({
    authorization,
    privateKey: accounts[0].privateKey,
  })

  expect(signature).toMatchInlineSnapshot(
    `"0x21bbc77c6985abee7a2e0cd446ba67fd2eb7763ab76127e2bb1a6f239e95c7c74f83ade665cce0d57ec2044f7c5b4fab9c5a52239cdc8443ae1a682c008ea12c1b"`,
  )
  expect(
    await verifyAuthorization({
      address: accounts[0].address,
      authorization,
      signature,
    }),
  ).toBe(true)
})
