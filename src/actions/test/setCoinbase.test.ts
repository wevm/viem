import { expect, test } from 'vitest'

import { testClient } from '~test/src/utils.js'

import { setCoinbase } from './setCoinbase.js'

test('set next block base fee per gas', async () => {
  await expect(
    setCoinbase(testClient, {
      address: '0x50821B3b78Da0255Ba2b7B6d62ae1f389EB987A4',
    }),
  ).resolves.toBeUndefined()
})
