import { expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { avalanche, fantom } from '../../chains/index.js'

import { switchChain } from './switchChain.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  await switchChain(client!, avalanche)
})

test('unsupported chain', async () => {
  await expect(switchChain(client!, fantom)).rejects.toMatchInlineSnapshot(
    '[Error: Unrecognized chain.]',
  )
})
