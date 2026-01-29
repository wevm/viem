import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { mainnetClient } from '~test/src/utils.js'

import { signMessage } from '../../accounts/utils/signMessage.js'
import { createSiweMessage } from '../../utils/siwe/createSiweMessage.js'
import { verifySiweMessage } from './verifySiweMessage.js'

const account = accounts[0]

test('default', async () => {
  const message = createSiweMessage({
    address: account.address,
    chainId: mainnetClient.chain.id,
    domain: 'example.com',
    nonce: 'foobarbaz',
    uri: 'https://example.com/path',
    version: '1',
  })

  const signature = await signMessage({
    message,
    privateKey: account.privateKey,
  })

  expect(
    await verifySiweMessage(mainnetClient, {
      message,
      signature,
    }),
  ).toBeTruthy()
})

test('behavior: invalid message fields', async () => {
  const message = createSiweMessage({
    address: account.address,
    chainId: mainnetClient.chain.id,
    domain: 'example.com',
    nonce: 'foobarbaz',
    uri: 'https://example.com/path',
    version: '1',
  })
  const signature = await signMessage({
    message,
    privateKey: account.privateKey,
  })
  expect(
    await verifySiweMessage(mainnetClient, {
      domain: 'viem.sh',
      message,
      signature,
    }),
  ).toBeFalsy()
})

test('behavior: invalid message', async () => {
  const message = 'foobarbaz'
  const signature = await signMessage({
    message,
    privateKey: account.privateKey,
  })
  expect(
    await verifySiweMessage(mainnetClient, {
      message,
      signature,
    }),
  ).toBeFalsy()
})
