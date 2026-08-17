import { Bytes } from 'ox'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { expect, test } from 'vitest'

import { Account, Actions, publicActions } from 'viem'

const client = anvil.getClient(anvil.mainnet)

const localAccount = Account.fromPrivateKey(constants.accounts[0].privateKey)

test('verifies a signed message', async () => {
  const signature = await localAccount.signMessage({
    message: 'hello world',
  })

  await expect(
    Actions.verifyMessage(client, {
      address: localAccount.address,
      message: 'hello world',
      signature,
    }),
  ).resolves.toBe(true)
})

test('args: message (raw)', async () => {
  const signature = await localAccount.signMessage({
    message: { raw: '0x68656c6c6f20776f726c64' },
  })

  await expect(
    Actions.verifyMessage(client, {
      address: localAccount.address,
      message: { raw: '0x68656c6c6f20776f726c64' },
      signature,
    }),
  ).resolves.toBe(true)
  await expect(
    Actions.verifyMessage(client, {
      address: localAccount.address,
      message: { raw: Bytes.fromString('hello world') },
      signature,
    }),
  ).resolves.toBe(true)
})

test('behavior: wrong message', async () => {
  const signature = await localAccount.signMessage({
    message: 'hello world',
  })

  await expect(
    Actions.verifyMessage(client, {
      address: localAccount.address,
      message: 'howdy world',
      signature,
    }),
  ).resolves.toBe(false)
})

test('behavior: wrong signer', async () => {
  const signature = await localAccount.signMessage({
    message: 'hello world',
  })

  await expect(
    Actions.verifyMessage(client, {
      address: constants.accounts[1].address,
      message: 'hello world',
      signature,
    }),
  ).resolves.toBe(false)
})

test('decorator', async () => {
  const decorated = client.extend(publicActions())
  const signature = await localAccount.signMessage({
    message: 'hello world',
  })

  await expect(
    decorated.verifyMessage({
      address: localAccount.address,
      message: 'hello world',
      signature,
    }),
  ).resolves.toBe(true)
})
