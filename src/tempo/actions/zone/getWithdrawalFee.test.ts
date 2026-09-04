import * as tempo from '~test/tempo.js'
import { Actions, Addresses } from 'viem/tempo'
import { expect, test } from 'vitest'

const client = tempo.getClient()
const stateOverride = {
  [Addresses.zoneOutbox]: {
    // Returns the first ABI argument.
    code: '0x60043560005260206000f3',
  },
} as const

test('default', async () => {
  expect(
    await Actions.zone.getWithdrawalFee(client, { stateOverride }),
  ).toMatchInlineSnapshot('0n')
})

test('args: callbackGas', async () => {
  expect(
    await client.zone.getWithdrawalFee({
      callbackGas: 100_000n,
      stateOverride,
    }),
  ).toMatchInlineSnapshot('100000n')
})
