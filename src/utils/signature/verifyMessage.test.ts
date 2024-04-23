import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { signMessage } from '../../actions/wallet/signMessage.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { verifyMessage } from './verifyMessage.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  let signature = await signMessage(client!, {
    account: accounts[0].address,
    message: 'hello world',
  })
  expect(
    await verifyMessage({
      address: accounts[0].address,
      message: 'hello world',
      signature,
    }),
  ).toBeTruthy()

  signature = await signMessage(client!, {
    account: accounts[0].address,
    message: 'wagmi 🥵',
  })
  expect(
    await verifyMessage({
      address: accounts[0].address,
      message: 'wagmi 🥵',
      signature,
    }),
  ).toBeTruthy()
})

test('raw message', async () => {
  expect(
    await verifyMessage({
      address: accounts[0].address,
      message: { raw: '0x68656c6c6f20776f726c64' },
      signature:
        '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
    }),
  ).toBe(true)
})
