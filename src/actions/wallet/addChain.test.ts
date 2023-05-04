import { avalanche } from '../../chains.js'
import { test } from 'vitest'

import { walletClient } from '../../_test/utils.js'
import { addChain } from './addChain.js'

test('default', async () => {
  await addChain(walletClient!, { chain: avalanche })
})

test('no block explorer', async () => {
  await addChain(walletClient!, {
    chain: { ...avalanche, blockExplorers: undefined },
  })
})
