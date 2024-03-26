import { expect, test } from 'vitest'
import { publicClientMainnet } from '../../../test/src/utils.js'
import { optimism } from '../../chains/index.js'
import { waitForNextL2Output } from './waitForNextL2Output.js'

// TODO: fix
test('default', async () => {
  const output = await waitForNextL2Output(publicClientMainnet, {
    l2BlockNumber: 19494651n,
    targetChain: optimism,
  })
  expect(output).toMatchInlineSnapshot(`
    {
      "l2BlockNumber": 105236863n,
      "outputIndex": 0n,
      "outputRoot": "0x21438336768f296ddf0fecd74ee1d4e56e66d937b3d9a3e964c9a5bf8eba63c3",
      "timestamp": 1686075935n,
    }
  `)
}, 20_000)

// TODO: fix
test('error: other', async () => {
  await expect(() =>
    waitForNextL2Output(publicClientMainnet, {
      l2BlockNumber: -1n,
      targetChain: optimism,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [IntegerOutOfRangeError: Number "-1n" is not in safe 256-bit unsigned integer range (0n to 115792089237316195423570985008687907853269984665640564039457584007913129639935n)

    Version: viem@1.0.2]
  `)
}, 20_000)
