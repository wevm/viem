import { expect, test } from 'vitest'
import { accounts } from '~test/src/constants.js'
import { generateSinglesigSmartAccountParams } from './generateSinglesigSmartAccountParams.js'

test('default', () => {
  expect(
    generateSinglesigSmartAccountParams({
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      secret: '0x11111',
    }),
  ).toMatchInlineSnapshot(`
      {
        "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signPayload": [Function],
      }
    `)
})

test('sign', async () => {
  const params = generateSinglesigSmartAccountParams({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    secret: accounts[0].privateKey,
  })

  expect(await params.signPayload('0x123456')).toMatchInlineSnapshot(`
        "0x9cbd53a576ef81eca7b8165eed1ba1398f747988a8e95a26be88d333f2b46ad43bfcba1476d179636cec7e88da97d292e70e6aa5f7424a17f223ae14ea7ad5d01b"
        `)
})
