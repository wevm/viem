import { expect, test } from 'vp/test'

import * as chains from './index.js'

test('exports: exposes chain constants', () => {
  expect({
    base: chains.base.id,
    basePreconf: chains.basePreconf.preconfirmationTime,
    mainnet: chains.mainnet.id,
    zksync: chains.zksync.id,
  }).toMatchInlineSnapshot(`
    {
      "base": 8453n,
      "basePreconf": 200,
      "mainnet": 1n,
      "zksync": 324n,
    }
  `)
})

test('exports: removes deprecated aliases', () => {
  expect({
    celoAlfajores: 'celoAlfajores' in chains,
    foundry: 'foundry' in chains,
    zkSync: 'zkSync' in chains,
    zeroG: 'zeroG' in chains,
  }).toMatchInlineSnapshot(`
    {
      "celoAlfajores": false,
      "foundry": false,
      "zeroG": false,
      "zkSync": false,
    }
  `)
})
