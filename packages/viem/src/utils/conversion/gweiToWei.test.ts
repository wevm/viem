import { expect, test } from 'vitest'

import { gweiToWei } from './gweiToWei'

test('converts gwei (as number) to wei', () => {
  expect(gweiToWei(6942069420)).toMatchInlineSnapshot('6942069420000000000n')
  expect(gweiToWei(50)).toMatchInlineSnapshot('50000000000n')
  expect(gweiToWei(1)).toMatchInlineSnapshot('1000000000n')
  expect(gweiToWei(0.5)).toMatchInlineSnapshot('500000000n')
  expect(gweiToWei(0.1)).toMatchInlineSnapshot('100000000n')
  expect(gweiToWei(0.01)).toMatchInlineSnapshot('10000000n')
  expect(gweiToWei(0.001)).toMatchInlineSnapshot('1000000n')
  expect(gweiToWei(0.001)).toMatchInlineSnapshot('1000000n')
  expect(gweiToWei(0.0001)).toMatchInlineSnapshot('100000n')
  expect(gweiToWei(0.00001)).toMatchInlineSnapshot('10000n')
  expect(gweiToWei(0.000001)).toMatchInlineSnapshot('1000n')
  expect(gweiToWei(0.0000001)).toMatchInlineSnapshot('100n')
  expect(gweiToWei(0.00000001)).toMatchInlineSnapshot('10n')
  expect(gweiToWei(0.000000001)).toMatchInlineSnapshot('1n')
})

test('converts gwei (as bigint) to wei', () => {
  expect(gweiToWei(694206942069420694206942069420n)).toMatchInlineSnapshot(
    '694206942069420694206942069420000000000n',
  )
  expect(gweiToWei(1n)).toMatchInlineSnapshot('1000000000n')
})
