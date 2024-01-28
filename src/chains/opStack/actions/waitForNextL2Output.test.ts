import { expect, test } from 'vitest'
import { http, createPublicClient } from '../../../index.js'
import { sepolia } from '../../index.js'
import { optimismSepolia } from '../chains.js'
import { waitForNextL2Output } from './waitForNextL2Output.js'

const client_sepolia = createPublicClient({
  chain: sepolia,
  transport: http(),
})
const client_opSepolia = createPublicClient({
  chain: optimismSepolia,
  transport: http(),
})

test('default', async () => {
  const output = await waitForNextL2Output(client_sepolia, {
    l2BlockNumber: 5270108n,
    targetChain: client_opSepolia.chain,
  })
  expect(output).toMatchInlineSnapshot(`
    {
      "l2BlockNumber": 5270160n,
      "outputIndex": 43917n,
      "outputRoot": "0x3487d3365d47596885589f06c5144136455c509327ac04aa88db30a0cc10353a",
      "timestamp": 1702343004n,
    }
  `)
}, 20_000)

test('error: other', async () => {
  await expect(() =>
    waitForNextL2Output(client_sepolia, {
      l2BlockNumber: -1n,
      targetChain: client_opSepolia.chain,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [IntegerOutOfRangeError: Number "-1n" is not in safe 256-bit unsigned integer range (0n to 115792089237316195423570985008687907853269984665640564039457584007913129639935n)

    Version: viem@1.0.2]
  `)
}, 20_000)
