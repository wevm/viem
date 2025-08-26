import { expect, test } from 'vitest'
import { accounts } from '../../../test/src/constants.js'
import { signMessage } from '../../accounts/index.js'
import { isErc8010Signature } from './isErc8010Signature.js'
import { serializeErc8010Signature } from './serializeErc8010Signature.js'

test('default', async () => {
  const signature = await signMessage({
    message: 'hello world',
    privateKey: accounts[0].privateKey,
  })

  expect(isErc8010Signature(signature)).toBe(false)

  const erc8010Signature = serializeErc8010Signature({
    authorization: {
      address: accounts[0].address,
      chainId: 1,
      nonce: 0,
      r: '0x0000000000000000000000000000000000000000000000000000000000000000',
      s: '0x0000000000000000000000000000000000000000000000000000000000000000',
      yParity: 0,
    },
    data: '0xdeadbeef',
    signature,
  })
  expect(isErc8010Signature(erc8010Signature)).toBe(true)
})
