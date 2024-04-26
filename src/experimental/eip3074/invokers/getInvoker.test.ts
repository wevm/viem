import { expect, test } from 'vitest'
import { anvil3074 } from '../../../../test/src/anvil.js'
import { batchInvokerCoder } from './coders/batchInvokerCoder.js'
import { getInvoker } from './getInvoker.js'

const client = anvil3074.getClient({ account: true })

test('default', async () => {
  // Initialize an invoker with it's contract address & `args` coder.
  const invoker = getInvoker({
    address: '0x0D44f617435088c947F00B31160f64b074e412B4',
    client,
    coder: batchInvokerCoder(),
  })
  expect(invoker).toMatchInlineSnapshot(`
    {
      "address": "0x0D44f617435088c947F00B31160f64b074e412B4",
      "execute": [Function],
      "sign": [Function],
    }
  `)
})
