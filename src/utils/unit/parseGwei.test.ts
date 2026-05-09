import { expect, test } from 'vitest'

import { parseGwei } from './parseGwei.js'

test('converts gwei to wei', () => {
  expect(parseGwei('69420.1234567')).toMatchInlineSnapshot('69420123456700n')
  expect(parseGwei('69420')).toMatchInlineSnapshot('69420000000000n')
  expect(parseGwei('1')).toMatchInlineSnapshot('1000000000n')
  expect(parseGwei('0.5')).toMatchInlineSnapshot('500000000n')
  expect(parseGwei('0.1')).toMatchInlineSnapshot('100000000n')
  expect(parseGwei('0.01')).toMatchInlineSnapshot('10000000n')
  expect(parseGwei('0.001')).toMatchInlineSnapshot('1000000n')
  expect(parseGwei('0.0001')).toMatchInlineSnapshot('100000n')
  expect(parseGwei('0.00001')).toMatchInlineSnapshot('10000n')
  expect(parseGwei('0.000001')).toMatchInlineSnapshot('1000n')
  expect(parseGwei('0.0000001')).toMatchInlineSnapshot('100n')
  expect(parseGwei('0.00000001')).toMatchInlineSnapshot('10n')
  expect(parseGwei('0.000000001')).toMatchInlineSnapshot('1n')

  expect(parseGwei('-6942060.123456')).toMatchInlineSnapshot(
    '-6942060123456000n',
  )
  expect(parseGwei('-6942069420')).toMatchInlineSnapshot(
    '-6942069420000000000n',
  )
  expect(parseGwei('-1')).toMatchInlineSnapshot('-1000000000n')
  expect(parseGwei('-0.5')).toMatchInlineSnapshot('-500000000n')
  expect(parseGwei('-0.1')).toMatchInlineSnapshot('-100000000n')
  expect(parseGwei('-0.01')).toMatchInlineSnapshot('-10000000n')
  expect(parseGwei('-0.001')).toMatchInlineSnapshot('-1000000n')
  expect(parseGwei('-0.0001')).toMatchInlineSnapshot('-100000n')
  expect(parseGwei('-0.00001')).toMatchInlineSnapshot('-10000n')
  expect(parseGwei('-0.000001')).toMatchInlineSnapshot('-1000n')
  expect(parseGwei('-0.0000001')).toMatchInlineSnapshot('-100n')
  expect(parseGwei('-0.00000001')).toMatchInlineSnapshot('-10n')
  expect(parseGwei('-0.000000001')).toMatchInlineSnapshot('-1n')
})

test('converts to rounded wei', () => {
  expect(parseGwei('0.0000000001')).toMatchInlineSnapshot('0n')
  expect(parseGwei('0.00000000059')).toMatchInlineSnapshot('1n')
  expect(parseGwei('1.00000000059')).toMatchInlineSnapshot('1000000001n')
  expect(parseGwei('69.59000000059')).toMatchInlineSnapshot('69590000001n')
  expect(parseGwei('1.2345678912345222')).toMatchInlineSnapshot('1234567891n')
  expect(parseGwei('-0.0000000001')).toMatchInlineSnapshot('0n')
  expect(parseGwei('-0.00000000059')).toMatchInlineSnapshot('-1n')
  expect(parseGwei('-1.00000000059')).toMatchInlineSnapshot('-1000000001n')
  expect(parseGwei('-69.59000000059')).toMatchInlineSnapshot('-69590000001n')
  expect(parseGwei('-1.2345678912345222')).toMatchInlineSnapshot('-1234567891n')
})
