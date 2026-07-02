import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { expect, test } from 'vitest'

import { Account, Actions, publicActions } from 'viem'

const client = anvil.getClient(anvil.mainnet)

const localAccount = Account.fromPrivateKey(constants.accounts[0].privateKey)

const typedData = {
  domain: {
    chainId: 1,
    name: 'Ether Mail',
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    version: '1',
  },
  types: {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  },
  primaryType: 'Mail',
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
} as const

test('verifies signed typed data', async () => {
  const signature = await localAccount.signTypedData(typedData)

  await expect(
    Actions.verifyTypedData(client, {
      ...typedData,
      address: localAccount.address,
      signature,
    }),
  ).resolves.toBe(true)
})

test('behavior: wrong message', async () => {
  const signature = await localAccount.signTypedData(typedData)

  await expect(
    Actions.verifyTypedData(client, {
      ...typedData,
      address: localAccount.address,
      message: {
        ...typedData.message,
        contents: 'Hello, Alice!',
      },
      signature,
    }),
  ).resolves.toBe(false)
})

test('behavior: wrong signer', async () => {
  const signature = await localAccount.signTypedData(typedData)

  await expect(
    Actions.verifyTypedData(client, {
      ...typedData,
      address: constants.accounts[1].address,
      signature,
    }),
  ).resolves.toBe(false)
})

test('decorator', async () => {
  const decorated = client.extend(publicActions())
  const signature = await localAccount.signTypedData(typedData)

  await expect(
    decorated.verifyTypedData({
      ...typedData,
      address: localAccount.address,
      signature,
    }),
  ).resolves.toBe(true)
})
