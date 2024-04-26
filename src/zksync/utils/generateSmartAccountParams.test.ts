import { expect, test } from 'vitest'
import { accounts } from '~test/src/constants.js'
import { generateSmartAccountParams } from './generateSmartAccountParams.js'

test('default', () => {
  expect(
    generateSmartAccountParams({
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      secret: '0x11111',
    }),
  ).toMatchInlineSnapshot(`
      {
        "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "sign": [Function],
      }
    `)
})

test('default with account', () => {
  expect(
    generateSmartAccountParams({
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      secret: '0x11111',
      account: accounts[1].address,
    }),
  ).toMatchInlineSnapshot(`
      {
        "account": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "sign": [Function],
      }
    `)
})

test('sign', async () => {
  const params = generateSmartAccountParams({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    secret: accounts[0].privateKey,
    account: accounts[1].address,
  })

  expect(await params.sign('0x123456')).toMatchInlineSnapshot(`
        "0x9cbd53a576ef81eca7b8165eed1ba1398f747988a8e95a26be88d333f2b46ad43bfcba1476d179636cec7e88da97d292e70e6aa5f7424a17f223ae14ea7ad5d01b"
        `)
})
