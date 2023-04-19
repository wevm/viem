import { test } from 'vitest'

import { walletClient, setupAnvil } from '../../_test/index.js'
import { avalanche } from '../../chains.js'

import { addChain } from './addChain.js'

setupAnvil()

test('default', async () => {
  await addChain(walletClient!, { chain: avalanche })
})

test('no block explorer', async () => {
  await addChain(walletClient!, {
    chain: { ...avalanche, blockExplorers: undefined },
  })
})
