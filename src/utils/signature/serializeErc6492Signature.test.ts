import { expect, test } from 'vitest'
import { accounts } from '../../../test/src/constants.js'
import { signMessage } from '../../accounts/index.js'
import { serializeErc6492Signature } from './serializeErc6492Signature.js'

test('default', async () => {
  const signature = await signMessage({
    message: 'hello world',
    privateKey: accounts[0].privateKey,
  })

  const wrapped = serializeErc6492Signature({
    address: '0xcafebabecafebabecafebabecafebabecafebabe',
    data: '0xdeadbeef',
    signature,
  })
  expect(wrapped).toBeDefined()
  expect(wrapped.length).toBe(642)
})
