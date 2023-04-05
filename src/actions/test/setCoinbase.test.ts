import { test } from 'vitest'

import { testClient } from '../../_test/index.js'

import { setCoinbase } from './setCoinbase.js'

test('set next block base fee per gas', async () => {
  await setCoinbase(testClient, {
    address: '0x50821B3b78Da0255Ba2b7B6d62ae1f389EB987A4',
  })
})
