import { test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { avalanche } from '../../chains/index.js'

import { addChain } from './addChain.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  await addChain(client!, { chain: avalanche })
})

test('no block explorer', async () => {
  await addChain(client!, {
    chain: { ...avalanche, blockExplorers: undefined },
  })
})
