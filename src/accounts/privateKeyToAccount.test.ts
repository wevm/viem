import { expect, test } from 'vitest'
import { accounts } from '../_test'
import { privateKeyToAccount } from './privateKeyToAccount'

test('default', () => {
  expect(privateKeyToAccount(accounts[0].privateKey)).toMatchInlineSnapshot(`
    {
      "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "getPrivateKey": [Function],
      "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
      "signMessage": [Function],
      "signTransaction": [Function],
      "signTypedData": [Function],
      "source": "privateKey",
      "type": "local",
    }
  `)
})

test('sign message', async () => {
  const account = privateKeyToAccount(accounts[0].privateKey)
  expect(
    await account.signMessage({ message: 'hello world' }),
  ).toMatchInlineSnapshot(
    '"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b"',
  )
})
