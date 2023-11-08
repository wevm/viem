import { describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { optimismClient } from '~test/src/optimism.js'
import { opStackPublicActions } from './public.js'

const opStackClient = optimismClient.extend(opStackPublicActions)

test('default', async () => {
  expect(opStackPublicActions(optimismClient)).toMatchInlineSnapshot(`
    {
      "estimateL1Fee": [Function],
      "estimateL1Gas": [Function],
      "estimateTotalFee": [Function],
      "estimateTotalGas": [Function],
    }
  `)
})

describe('smoke test', () => {
  test('estimateL1Gas', async () => {
    const gas = await opStackClient.estimateL1Gas({
      account: accounts[0].address,
    })
    expect(gas).toBeDefined()
  })

  test('estimateTotalGas', async () => {
    const gas = await opStackClient.estimateTotalGas({
      account: accounts[0].address,
    })
    expect(gas).toBeDefined()
  })

  test('estimateL1Fee', async () => {
    const fee = await opStackClient.estimateL1Fee({
      account: accounts[0].address,
    })
    expect(fee).toBeDefined()
  })

  test('estimateTotalFee', async () => {
    const fee = await opStackClient.estimateTotalFee({
      account: accounts[0].address,
    })
    expect(fee).toBeDefined()
  })
})
