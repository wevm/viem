import { expect, test } from 'vitest'

import { wagmiContractConfig, publicClient, walletClient } from '../_test'
import { getContract } from './getContract'

// TODO
// - add `estimateGas`, `createEventFilter`, `watchEvent`
// - runtime tests (make sure protype names work as expected)
// - docs
// - prettify types
// - event `args` type cleanup

test('getContract', async () => {
  const contract = getContract({
    ...wagmiContractConfig,
    publicClient,
    walletClient,
  })
  await expect(
    contract.read.balanceOf(['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e']),
  ).resolves.toMatchInlineSnapshot('0n')
})
