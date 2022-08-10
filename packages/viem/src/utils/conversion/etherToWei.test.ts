import { expect, test } from 'vitest'

import { etherToWei } from './etherToWei'

test('converts ether (as number) to wei', () => {
  expect(etherToWei(6942069420)).toMatchInlineSnapshot(
    '6942069420000000000000000000n',
  )
  expect(etherToWei(1)).toMatchInlineSnapshot('1000000000000000000n')
  expect(etherToWei(0.5)).toMatchInlineSnapshot('500000000000000000n')
  expect(etherToWei(0.1)).toMatchInlineSnapshot('100000000000000000n')
  expect(etherToWei(0.00000000001)).toMatchInlineSnapshot('10000000n')
  expect(etherToWei(0.000000000001)).toMatchInlineSnapshot('1000000n')
  expect(etherToWei(0.0000000000001)).toMatchInlineSnapshot('100000n')
  expect(etherToWei(0.00000000000001)).toMatchInlineSnapshot('10000n')
  expect(etherToWei(0.000000000000001)).toMatchInlineSnapshot('1000n')
  expect(etherToWei(0.0000000000000001)).toMatchInlineSnapshot('100n')
  expect(etherToWei(0.00000000000000001)).toMatchInlineSnapshot('10n')
  expect(etherToWei(0.000000000000000001)).toMatchInlineSnapshot('1n')
})

test('converts ether (as bigint) to wei', () => {
  expect(etherToWei(694206942069420694206942069420n)).toMatchInlineSnapshot(
    '694206942069420694206942069420000000000000000000n',
  )
  expect(etherToWei(1n)).toMatchInlineSnapshot('1000000000000000000n')
})
