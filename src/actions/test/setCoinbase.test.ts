import { expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { setCoinbase } from './setCoinbase.js'

const client = anvilMainnet.getClient()

test('set next block base fee per gas', async () => {
  await expect(
    setCoinbase(client, {
      address: '0x50821B3b78Da0255Ba2b7B6d62ae1f389EB987A4',
    }),
  ).resolves.toBeUndefined()
})
