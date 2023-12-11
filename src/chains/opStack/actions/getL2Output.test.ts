import { expect, test } from 'vitest'
import { publicClientMainnet } from '../../../../test/src/utils.js'
import { base } from '../chains.js'
import { getL2Output } from './getL2Output.js'

test('default', async () => {
  const result = await getL2Output(publicClientMainnet, {
    l2BlockNumber: 2725977n,
    targetChain: base,
  })
  expect(result).toMatchInlineSnapshot(`
    {
      "l2BlockNumber": 2727000n,
      "outputIndex": 1514n,
      "outputRoot": "0xff22d9720c41431eb398a07c5b315199f8f0dc6a07643e4e43a20b910f12f2f2",
      "timestamp": 1692244499n,
    }
  `)
})
