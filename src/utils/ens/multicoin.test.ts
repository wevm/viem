import { expect, test } from 'vitest'
import { multicoinFromCoinId, multicoinFromName } from './multicoin'

test('get multicoin from name', () => {
  expect(multicoinFromName('BTC')).toMatchInlineSnapshot(`
    {
      "coinType": 0,
      "decoder": [Function],
      "encoder": [Function],
      "name": "BTC",
    }
  `)
})

test('get multicoin from coin id', () => {
  expect(multicoinFromCoinId(0)).toMatchInlineSnapshot(`
    {
      "coinType": 0,
      "decoder": [Function],
      "encoder": [Function],
      "name": "BTC",
    }
  `)
})
