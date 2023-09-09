import { test } from 'vitest'

import { walletClient } from '~test/src/utils.js'
import { avalanche } from '../../chains/index.js'

import { addChain } from './addChain.js'

test('default', async () => {
  await addChain(walletClient!, { chain: avalanche })
})

test('no block explorer', async () => {
  await addChain(walletClient!, {
    chain: { ...avalanche, blockExplorers: undefined },
  })
})
