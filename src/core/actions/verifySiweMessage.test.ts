import { Siwe } from 'ox'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { expect, test } from 'vitest'

import { Account, Actions, publicActions } from 'viem'

const client = anvil.getClient(anvil.mainnet)

const localAccount = Account.fromPrivateKey(constants.accounts[0].privateKey)

function createMessage() {
  return Siwe.createMessage({
    address: localAccount.address,
    chainId: 1n,
    domain: 'example.com',
    issuedAt: new Date('2026-01-01T00:00:00.000Z'),
    nonce: 'foobarbaz12',
    uri: 'https://example.com/path',
    version: '1',
  })
}

test('verifies a signed SIWE message', async () => {
  const message = createMessage()
  const signature = await localAccount.signMessage({ message })

  await expect(
    Actions.verifySiweMessage(client, {
      message,
      signature,
    }),
  ).resolves.toBe(true)
})

test('args: address (mismatch fails)', async () => {
  const message = createMessage()
  const signature = await localAccount.signMessage({ message })

  await expect(
    Actions.verifySiweMessage(client, {
      address: constants.accounts[1].address,
      message,
      signature,
    }),
  ).resolves.toBe(false)
})

test('args: domain (mismatch fails)', async () => {
  const message = createMessage()
  const signature = await localAccount.signMessage({ message })

  await expect(
    Actions.verifySiweMessage(client, {
      domain: 'other.example.com',
      message,
      signature,
    }),
  ).resolves.toBe(false)
})

test('args: nonce (mismatch fails)', async () => {
  const message = createMessage()
  const signature = await localAccount.signMessage({ message })

  await expect(
    Actions.verifySiweMessage(client, {
      message,
      nonce: 'deadbeef00',
      signature,
    }),
  ).resolves.toBe(false)
})

test('behavior: wrong signer fails', async () => {
  const message = createMessage()
  const signature = await Account.fromPrivateKey(
    constants.accounts[1].privateKey,
  ).signMessage({ message })

  await expect(
    Actions.verifySiweMessage(client, {
      message,
      signature,
    }),
  ).resolves.toBe(false)
})

test('behavior: unparsable message fails', async () => {
  const signature = await localAccount.signMessage({ message: 'not siwe' })

  await expect(
    Actions.verifySiweMessage(client, {
      message: 'not siwe',
      signature,
    }),
  ).resolves.toBe(false)
})

test('decorator', async () => {
  const decorated = client.extend(publicActions())
  const message = createMessage()
  const signature = await localAccount.signMessage({ message })

  await expect(
    decorated.verifySiweMessage({
      message,
      signature,
    }),
  ).resolves.toBe(true)
})
