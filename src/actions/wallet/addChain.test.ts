import { test } from 'vitest'

import { walletClient } from '../../_test'
import { avalanche } from '../../chains'

import { addChain } from './addChain'

test('default', async () => {
  await addChain(walletClient!, avalanche)
})

test('no block explorer', async () => {
  await addChain(walletClient!, { ...avalanche, blockExplorers: undefined })
})
