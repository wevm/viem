import { expect, test } from 'vitest'
import { mainnetClient } from '~test/src/utils.js'
import { getL2TransactionHashes } from './getL2TransactionHashes.js'

test('default', async () => {
  const receipt = await mainnetClient.getTransactionReceipt({
    hash: '0x11fcc5e645f504064fd4e45120f6543115149449dfb44b7887000f3ed18b738a',
  })

  const l2Hashes = getL2TransactionHashes(receipt)

  expect(l2Hashes).toMatchInlineSnapshot(`
    [
      "0x59755e7eb89d13ec6261e412d8c50415fd6397fd7639b06db33b7d141b15ea51",
      "0x1fec4d9c3f6611acb61d3926c9c60bd2875467a1fbeece7032d5192776239336",
      "0x2d2b35da6bd289150d4885c5a6578779454bee430094625dab5e7893d6ad5e6a",
      "0xa81a336f05d34dfbb17a09a81cdaed3bad547b4cf4a677a367563d4529f7b46a",
      "0xcdde1528c410fe6329eb29a511c2af1263fb2290803e67dd54255a8d809bb182",
      "0xc97c9f03e7331d2b513cc4334274fe71985ef957d61b95f86d2cde833c33358e",
      "0x0777d0c1c9c1c9d5207b6d8fd40895a5c0780c5cc673dcedfe106c7fbb33d327",
      "0x6c8340ffe08537c62a29a36597e6529bcf5b00024ac32673397b0fa87353f0a0",
    ]
  `)
})
