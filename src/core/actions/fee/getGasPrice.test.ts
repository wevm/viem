import { expect, test } from 'vitest'
import { Actions } from 'viem'

import * as anvil from '~test/anvil.js'

test('default', async () => {
  expect(
    await Actions.fee.getGasPrice(anvil.getClient(anvil.mainnet)),
  ).toBeTypeOf('bigint')
})
