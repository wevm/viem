import { expect, test } from 'vitest'
import { anvil3074 } from '../../../../../test/src/anvil.js'
import { encodePacked } from '../../../../utils/index.js'
import { defineInvokerCoder } from './defineInvokerCoder.js'

const client = anvil3074.getClient()

test('default', async () => {
  const coder = defineInvokerCoder({
    async toExecData(args: string) {
      return encodePacked(['string'], [args])
    },
  })
  expect(
    await coder.toExecData('hello world', {
      authority: '0x0000000000000000000000000000000000000000',
      client,
      invokerAddress: '0x0000000000000000000000000000000000000000',
    }),
  ).toMatchInlineSnapshot(`"0x68656c6c6f20776f726c64"`)
})
