import { expect, test } from 'vitest'
import { accounts } from '~test/src/constants.js'
import { generateMultisigSmartAccountParams } from './generateMultisigSmartAccountParams.js'

test('default', () => {
  expect(
    generateMultisigSmartAccountParams({
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      secrets: ['0x11111', '0x22222'],
    }),
  ).toMatchInlineSnapshot(`
      {
        "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signPayload": [Function],
      }
    `)
})

test('sign', async () => {
  const params = generateMultisigSmartAccountParams({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    secrets: [
      accounts[0].privateKey,
      '0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3',
    ],
  })

  expect(await params.signPayload('0x123456')).toMatchInlineSnapshot(`
        "0x9cbd53a576ef81eca7b8165eed1ba1398f747988a8e95a26be88d333f2b46ad43bfcba1476d179636cec7e88da97d292e70e6aa5f7424a17f223ae14ea7ad5d01b813a77501bc544533d81f338f4973956f720cc554069d1875b0f377d259ed54a3ee5aa7eda86925f69df5688cd6ab2551e76bbbf76d8e6a8c3cdf2c0f35bb54b1b"
        `)
})

test('sign with one secret', async () => {
  const params = generateMultisigSmartAccountParams({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    secrets: [accounts[0].privateKey],
  })
  try {
    await params.signPayload('0x123456')
    throw new Error('Should throw an error')
  } catch (e: any) {
    expect(e.message).toMatchInlineSnapshot(
      `"Multiple keys are required for multisig transaction signing!"`,
    )
  }
})
