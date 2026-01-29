import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { signMessage } from '../../actions/wallet/signMessage.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { hashMessage } from './hashMessage.js'
import { verifyHash } from './verifyHash.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  let signature = await signMessage(client!, {
    account: accounts[0].address,
    message: 'hello world',
  })
  expect(
    await verifyHash({
      address: accounts[0].address,
      hash: hashMessage('hello world'),
      signature,
    }),
  ).toBeTruthy()

  signature = await signMessage(client!, {
    account: accounts[0].address,
    message: 'wagmi 🥵',
  })
  expect(
    await verifyHash({
      address: accounts[0].address,
      hash: hashMessage('wagmi 🥵'),
      signature,
    }),
  ).toBeTruthy()
})
